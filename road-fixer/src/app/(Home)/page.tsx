"use client";

import Login from "@/Components/Dialogs/Login";

export default function Home() {
  return (
    <div className="hero bg-base-300 h-[57vh]">
      <div className="hero-content text-center w-[50vw]">
        <div className="w-full">
          <h1 className="text-5xl font-bold text-primary">
            Welcome to RoadFixer
          </h1>
          <p className="py-6 text-base-content">
            Transforming road safety with innovative pothole detection and
            repair solutions. Identify, report, and take action to ensure
            smoother and safer journeys for everyone. Join us in revolutionizing
            road maintenance through smart technology!
          </p>
          <button
            className="btn btn-primary hover:btn-secondary"
            onClick={() => {
              (
                document.getElementById("login") as HTMLDialogElement
              ).showModal();
            }}
          >
            Get Started Now
          </button>
        </div>
      </div>
      <Login />
    </div>
  );
}
