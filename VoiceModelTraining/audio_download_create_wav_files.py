# Download a youtube video and convert it to wav files and split into 18 second segments

import yt_dlp
import os
import subprocess
from pydub import AudioSegment
import librosa
import soundfile as sf

def download_youtube_audio(url, output_path):
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': output_path,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        filename = ydl.prepare_filename(info)
    return filename

def convert_to_wav(input_file, output_file):
    command = [
        'ffmpeg',
        '-i', input_file,
        '-acodec', 'pcm_s16le',
        '-ar', '22050',
        '-ac', '1',
        output_file
    ]
    subprocess.run(command, check=True)

def ensure_valid_wav(file_path, target_sample_rate):
    x, _ = librosa.load(file_path, sr=target_sample_rate)
    sf.write(file_path, x, target_sample_rate, subtype='PCM_16')

def process_audio(input_file, output_folder, target_sample_rate, segment_duration):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    audio = AudioSegment.from_wav(input_file)
    
    # Set sample rate
    audio = audio.set_frame_rate(target_sample_rate)

    # Ensure 16-bit depth
    audio = audio.set_sample_width(2)

    # Split the audio into segments
    segment_duration_ms = segment_duration * 1000  # Convert to milliseconds
    for i, start in enumerate(range(0, len(audio), segment_duration_ms)):
        segment = audio[start:start+segment_duration_ms]
        output_path = os.path.join(output_folder, f"{i+1}.wav")
        segment.export(output_path, format="wav", parameters=["-acodec", "pcm_s16le"])
        ensure_valid_wav(output_path, target_sample_rate)

    print(f"Audio processed and split into segments in the '{output_folder}' folder.")

# Main execution
youtube_url = "YOUR_YOUTUBE_URL_HERE"  # Replace with your YouTube URL
downloaded_file = "downloaded_audio"
output_folder = "wav"
target_sample_rate = 22050  # or 16000
segment_duration = 18  # in seconds

# Download the YouTube video as audio
actual_filename = download_youtube_audio(youtube_url, downloaded_file)
print(f"Downloaded file: {actual_filename}")

# Convert to WAV
wav_filename = actual_filename + ".wav"
convert_to_wav(actual_filename, wav_filename)
print(f"Converted to WAV: {wav_filename}")

# Process the downloaded audio
process_audio(wav_filename, output_folder, target_sample_rate, segment_duration)

# Clean up the downloaded files
os.remove(actual_filename)
os.remove(wav_filename)