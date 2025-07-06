import csv
import os
import cv2
from ultralytics import YOLO
from datetime import datetime

# Paths for the model and output directory
model_path = os.path.join(os.path.dirname(__file__), "model/pothole_detection.pt")
csv_dir = os.path.join(os.path.dirname(__file__), "csv")
os.makedirs(csv_dir, exist_ok=True)

# Load YOLO model
model = YOLO(model=model_path, task="detect")
class_names = ["pothole"]

def live_pothole_detection():
    cap = cv2.VideoCapture(0)  # Use 0 for default webcam
    if not cap.isOpened():
        print("Error opening the camera.")
        return

    csv_path = os.path.join(csv_dir, f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_potholes_detection_only.csv")
    with open(csv_path, mode="w", newline="") as csv_file:
        csv_writer = csv.writer(csv_file)
        csv_writer.writerow(["Pothole ID", "Bounding Box (x, y, w, h)", "Timestamp"])

        pothole_id = 0

        print("Press 'q' to stop the live detection.")
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                print("Error capturing frame.")
                break

            results = model(frame)
            annotated_frame = frame.copy()

            for result in results:
                for box in result.boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    class_id = int(box.cls[0])
                    class_name = class_names[class_id] if class_id < len(class_names) else "Unknown"

                    if x1 < 0 or y1 < 0 or x2 > frame.shape[1] or y2 > frame.shape[0] or x1 >= x2 or y1 >= y2:
                        continue

                    pothole_id += 1
                    bbox_str = f"({x1}, {y1}, {x2 - x1}, {y2 - y1})"
                    timestamp = datetime.now().strftime('%H:%M:%S')
                    csv_writer.writerow([pothole_id, bbox_str, timestamp])

                    cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    cv2.putText(
                        annotated_frame,
                        f"{class_name} ID:{pothole_id}",
                        (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.6,
                        (0, 255, 255),
                        2
                    )

            cv2.imshow("Live Pothole Detection (Only Bounding Boxes)", annotated_frame)

            # Stop on pressing 'q'
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

    cap.release()
    cv2.destroyAllWindows()
    print(f"Live detection completed. Results saved to {csv_path}")

if __name__ == "__main__":
    live_pothole_detection()
