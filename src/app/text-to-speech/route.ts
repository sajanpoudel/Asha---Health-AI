import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';

const execPromise = util.promisify(exec);

const emotionMap: { [key: string]: string } = {
  affectionate: '--emotion Happy --speaker_id 0',
  joyful: '--emotion Happy --speaker_id 1',
  sad: '--emotion Sad --speaker_id 2',
  anxious: '--emotion Fearful --speaker_id 3',
  angry: '--emotion Angry --speaker_id 4',
  playful: '--emotion Happy --speaker_id 5',
  warm: '--emotion Neutral --speaker_id 6'
};

export async function POST(request: Request) {
  const { text, emotion, voiceStyle } = await request.json();

  console.log("Received request:", { text, emotion, voiceStyle });

  // Generate a unique filename
  const filename = `speech_${Date.now()}.wav`;
  const outputPath = path.join(process.cwd(), 'public', 'audio', filename);

  // Get emotion and speaker settings
  const emotionSettings = emotionMap[emotion] || '--emotion Neutral --speaker_id 0';

  // Add speed parameter (0.8 for slightly slower speech)
  const speedSetting = '--speed 0.8';

  // Construct the Piper command
  const piperCommand = `echo "${text}" | ${process.env.PIPER_PATH} --model ${process.env.PIPER_MODEL_PATH} ${emotionSettings} ${speedSetting} --sentence-silence 0.2 --output_file ${outputPath}`;

  console.log("Piper command:", piperCommand);

  try {
    // Execute Piper
    const { stdout, stderr } = await execPromise(piperCommand);
    console.log("Piper stdout:", stdout);
    console.log("Piper stderr:", stderr);

    // Check if the file was created
    if (!fs.existsSync(outputPath)) {
      throw new Error("Output file was not created");
    }

    // Read the generated audio file
    const audioBuffer = fs.readFileSync(outputPath);

    console.log("Audio file size:", audioBuffer.length);

    // Create the response
    const response = new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Disposition': `attachment; filename=${filename}`
      },
    });

    // Optionally, delete the file after sending
    fs.unlinkSync(outputPath);

    return response;
  } catch (error) {
    console.error("Error in Piper TTS:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to generate speech', details: errorMessage }, { status: 500 });
  }
}