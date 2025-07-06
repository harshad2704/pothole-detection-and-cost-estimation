import csv
import os
import sys
from ultralytics import YOLO
import cv2
import torch
import numpy as np
from datetime import datetime
from deep_sort_realtime.deepsort_tracker import DeepSort

# Paths for the model and output directory
model_path = os.path.join(os.path.dirname(__file__), "model/pothole_detection.pt")
csv_dir = os.path.join(os.path.dirname(__file__), "csv")
os.makedirs(csv_dir, exist_ok=True)

# Load YOLO detection model
model = YOLO(model=model_path, task="detect")

# Load MiDaS depth estimation model
dpt_model_type = "DPT_Hybrid"
midas = torch.hub.load("intel-isl/MiDaS", model=dpt_model_type, pretrained=True)
midas_transforms = torch.hub.load("intel-isl/MiDaS", "transforms").small_transform
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
midas.to(device).eval()

# Initialize DeepSORT tracker
tracker = DeepSort(max_age=30, max_iou_distance=0.3)

# Conversion factors
PIXEL_TO_CM = 0.035  # for length and breadth
depth_scale = 0.001  # for MiDaS depth to real-world cm

# Utility function
def convert_to_real_world(pixels, factor=PIXEL_TO_CM):
    return pixels * factor

# Main detection function
async def detect_potholes(video_path, visualize=True):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print("Error opening video.")
        return

    # Prepare CSV output
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    csv_path = os.path.join(csv_dir, f"{timestamp}_potholes.csv")

    # Data stores
    pothole_data = {}   # uid -> [length_cm, breadth_cm, fixed_depth, volume]
    id_mapping = {}
    global_id = 1

    # Additional storage for top-4 depth values
    depth_samples = {}  # uid -> list of top depth values

    with open(csv_path, mode="w", newline="") as csv_file:
        writer = csv.writer(csv_file)
        writer.writerow(["Pothole ID", "Length (cm)", "Breadth (cm)", "Depth (cm)", "Volume (cm^3)"])

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            # YOLO inference
            results = model(frame)

            # Depth estimation map
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            input_batch = midas_transforms(rgb).to(device)
            with torch.no_grad():
                prediction = midas(input_batch)
                prediction = torch.nn.functional.interpolate(
                    prediction.unsqueeze(1),
                    size=frame.shape[:2],
                    mode="bicubic",
                    align_corners=False
                ).squeeze()
            depth_map = prediction.cpu().numpy()

            # Prepare detections for tracker
            detections = []
            for res in results:
                for box in res.boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                    conf = float(box.conf[0])
                    detections.append(([x1, y1, x2-x1, y2-y1], conf, "pothole"))

            tracks = tracker.update_tracks(detections, frame=frame)

            for track in tracks:
                if not track.is_confirmed():
                    continue

                t_id = track.track_id
                if t_id not in id_mapping:
                    id_mapping[t_id] = global_id
                    global_id += 1
                uid = id_mapping[t_id]

                x, y, w, h = map(int, track.to_ltwh())
                x2, y2 = x+w, y+h

                # On first detection or continuing: calculate and refine depth
                if uid not in pothole_data:
                    length_cm = convert_to_real_world(w)
                    breadth_cm = convert_to_real_world(h)

                    # ROI depth values
                    roi = depth_map[y:y2, x:x2]
                    vals = roi[roi > 0]

                    if vals.size:
                        if uid not in depth_samples:
                            depth_samples[uid] = []

                        depth_samples[uid].append(np.max(vals) * depth_scale)
                        depth_samples[uid] = sorted(depth_samples[uid], reverse=True)[:4]

                        depth_val = np.mean(depth_samples[uid])
                    else:
                        depth_val = 0

                    volume = length_cm * breadth_cm * depth_val
                    pothole_data[uid] = [length_cm, breadth_cm, depth_val, volume]

                # Retrieve fixed values
                length_cm, breadth_cm, fixed_depth, volume = pothole_data[uid]

                # Visualization
                cv2.rectangle(frame, (x, y), (x2, y2), (0, 255, 0), 2)
                txt = f"ID:{uid} L:{length_cm:.1f} B:{breadth_cm:.1f} D:{fixed_depth:.1f}"
                cv2.putText(frame, txt, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 255, 255), 2)

            if visualize:
                window_name = "Pothole Detection"
                display_frame = cv2.resize(frame, (640, 360))

                cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
                cv2.resizeWindow(window_name, 640, 360)

                screen_width, screen_height = 1920, 1080
                win_x = (screen_width - 640) // 2
                win_y = (screen_height - 360) // 2
                cv2.moveWindow(window_name, win_x, win_y)

                cv2.imshow(window_name, display_frame)

                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break

        # Write CSV
        total_vol = sum(v[3] for v in pothole_data.values())
        for pid, (l, b, d, v) in pothole_data.items():
            writer.writerow([pid, f"{l:.2f}", f"{b:.2f}", f"{d:.2f}", f"{v:.2f}"])
        writer.writerow([])
        writer.writerow(["Total", "-", "-", "-", f"{total_vol:.2f}"])

    cap.release()
    cv2.destroyAllWindows()
    print(f"Detection complete. CSV saved to {csv_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python detect.py <video_path>")
    else:
        import asyncio
        asyncio.run(detect_potholes(sys.argv[1]))
