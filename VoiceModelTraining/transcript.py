import os
import ssl
import wave

import whisper

# Disable SSL certificate verification (use with caution)
ssl._create_default_https_context = ssl._create_unverified_context

WAV_FOLDER = "wav"
TRANSCRIPT_FILE = "transcript.txt"


def list_wav_files(wav_folder):
    """Return the numbered wav files of a folder in numeric order."""
    wav_files = [file for file in os.listdir(wav_folder) if file.endswith(".wav")]
    return sorted(wav_files, key=lambda x: int(os.path.splitext(x)[0]))


def main():
    # Load the whisper model
    model = whisper.load_model("base")

    wav_files = list_wav_files(WAV_FOLDER)

    # Open a text file for writing the transcripts
    with open(TRANSCRIPT_FILE, "w") as transcript_file:
        # Iterate through each WAV file
        for wav_file in wav_files:
            print(f"Transcribing {wav_file}")
            try:
                # Check if the file is a valid WAV file
                with wave.open(os.path.join(WAV_FOLDER, wav_file), "rb") as w:
                    # If we can read the WAV file, it's valid
                    pass

                # Transcribe the current WAV file
                result = model.transcribe(os.path.join(WAV_FOLDER, wav_file))

                # Remove leading and trailing spaces from the transcribed text
                transcribed_text = result["text"].strip()

                # Write the result to the transcript file in the specified format
                transcript_file.write(f"wavs/{wav_file}|{transcribed_text}\n")
            except Exception as e:
                print(f"Error processing {wav_file}: {str(e)}")

    print(f"Transcription complete. Check '{TRANSCRIPT_FILE}' for results.")


if __name__ == "__main__":
    main()
