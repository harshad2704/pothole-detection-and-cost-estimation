import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const pythonScriptPath = "python/live_pothole_detection.py";
    const command = `python ${pythonScriptPath}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Error executing Python script:", error);
        throw new Error("Failed to start live detection.");
      }
      if (stderr) {
        console.warn("Python script warning:", stderr);
      }
      console.log("Python script output:", stdout);
    });

    return NextResponse.json({
      message: "Live pothole detection started successfully!",
    });
  } catch (error) {
    console.error("Error starting live detection:", error);
    return NextResponse.json(
      { error: "Failed to start live detection." },
      { status: 500 }
    );
  }
}
