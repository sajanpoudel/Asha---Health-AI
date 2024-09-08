import os
import whisper
import ssl
import wave

# Disable SSL certificate verification (use with caution)
ssl._create_default_https_context = ssl._create_unverified_context

# Load the whisper model
model = whisper.load_model("base")

# Get the list of WAV files in the 'wav' folder
wav_folder = 'wav'
wav_files = [file for file in os.listdir(wav_folder) if file.endswith(".wav")]

# Sort the WAV files in numeric order
wav_files = sorted(wav_files, key=lambda x: int(os.path.splitext(x)[0]))

# Open a text file for writing the transcripts
with open("transcript.txt", "w") as transcript_file:
    # Iterate through each WAV file
    for wav_file in wav_files:
        print(f"Transcribing {wav_file}")
        try:
            # Check if the file is a valid WAV file
            with wave.open(os.path.join(wav_folder, wav_file), 'rb') as w:
                # If we can read the WAV file, it's valid
                pass
            
            # Transcribe the current WAV file
            result = model.transcribe(os.path.join(wav_folder, wav_file))

            # Remove leading and trailing spaces from the transcribed text
            transcribed_text = result['text'].strip()

            # Write the result to the transcript file in the specified format
            transcript_file.write(f"wavs/{wav_file}|{transcribed_text}\n")
        except Exception as e:
            print(f"Error processing {wav_file}: {str(e)}")

print("Transcription complete. Check 'transcript.txt' for results.")