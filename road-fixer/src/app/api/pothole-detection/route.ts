import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const fileName = "pothole-detection";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const video = formData.get("video") as File;

    if (!video) {
      return NextResponse.json(
        { error: "No video file provided." },
        { status: 400 }
      );
    }

    const fileExtension = video.name.split(".").pop();
    const filePath = `python/uploads/${fileName}.${fileExtension}`;

    fs.writeFileSync(filePath, Buffer.from(await video.arrayBuffer()));

    const pythonScriptPath = "python/pothole_detection.py";
    const command = `python ${pythonScriptPath} ${filePath}`;
    const { stdout, stderr } = await execAsync(command);
    if (stderr) {
      console.error("Python Script Error:", stderr);
      throw new Error("Video processed successfully!");
    }
    console.log("Python Script Output:", stdout);
    fs.unlinkSync(filePath);
    return NextResponse.json({
      message: "Video processed successfully!",
      output: stdout,
    });
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing the video." },
      { status: 500 }
    );
  }
}
