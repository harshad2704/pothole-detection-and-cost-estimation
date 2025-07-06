"use client";

import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";

const DetectPothole = () => {
  const [video, setVideo] = useState<File | null>(null);

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setVideo(event.target.files[0]);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!video) {
      toast.error("Please select a video to submit.");
      return;
    }
    const response = axios.postForm("/api/pothole-detection", { video });
    toast.promise(response, {
      loading: "Processing video...",
      success: "Video processed successfully!",
      error: "An error occurred while processing the video.",
    });
  };

  return (
    <div className="bg-base-100 h-[calc(100vh-10vh)] flex items-center justify-center">
      <div className="card w-full max-w-lg shadow-xl bg-base-200">
        <div className="card-body">
          <h2 className="card-title text-center">Pothole Detection</h2>
          <form onSubmit={handleSubmit} className="form-control gap-4">
            <div>
              <label className="label">
                <span className="label-text">Upload Video</span>
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="file-input file-input-bordered w-full"
              />
            </div>

            {video && (
              <div className="alert alert-info shadow-lg">
                <div>
                  <span>Selected Video: {video.name}</span>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full">
              Submit Video
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DetectPothole;
