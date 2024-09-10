import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import os from 'os';

const execAsync = promisify(exec);

const PIPER_PATH = process.env.PIPER_PATH || path.join(process.cwd(), 'piper', 'build', 'piper');
const MODEL_PATH = process.env.PIPER_MODEL_PATH || path.join(process.cwd(), 'piper', 'models', 'en_US-libritts-high.onnx');

export async function POST(request: Request) {
  const { text } = await request.json();

  if (!text) {
    return NextResponse.json({ error: 'Text is required' }, { status: 400 });
  }

  try {
    const outputFile = path.join(os.tmpdir(), `piper_output_${Date.now()}.wav`);
    const command = `echo "${text}" | "${PIPER_PATH}" --model "${MODEL_PATH}" --output_file "${outputFile}"`;

    await execAsync(command);

    const audioBuffer = fs.readFileSync(outputFile);
    fs.unlinkSync(outputFile); // Clean up the temporary file

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Disposition': 'attachment; filename="speech.wav"'
      }
    });
  } catch (error) {
    console.error('Error in text to speech:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}