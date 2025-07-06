"use client";

import axios from "axios";
import toast from "react-hot-toast";
import { useState } from "react";

const LiveDetection = () => {
  const [isRunning, setIsRunning] = useState(false);

  const handleStartDetection = async () => {
    try {
      setIsRunning(true);
      const response = axios.post("/api/start-live-detection");
      toast.promise(response, {
        loading: "Starting live detection...",
        success: "Live detection started successfully!",
        error: "Failed to start live detection.",
      });
    } catch (error) {
      toast.error("Failed to start live detection.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-6 bg-base-300 h-[87vh] flex items-center justify-center flex-col">
      <h1 className="text-3xl font-bold mb-4">Live Pothole Detection</h1>
      <p className="text-lg mb-6">
        Start the live pothole detection system. A new window will open with
        real-time analysis.
      </p>

      <button
        className={`btn btn-primary ${isRunning ? "btn-disabled" : ""}`}
        onClick={handleStartDetection}
        disabled={isRunning}
      >
        {isRunning ? "Starting..." : "Start Live Detection"}
      </button>
    </div>
  );
};

export default LiveDetection;
