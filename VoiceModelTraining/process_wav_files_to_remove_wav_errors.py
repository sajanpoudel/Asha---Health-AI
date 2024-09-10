import os
import wave
import datetime
import zipfile

def is_valid_wav(file_path):
    try:
        with wave.open(file_path, "rb") as wave_file:
            if wave_file.getnchannels() != 1 or wave_file.getsampwidth() != 2:
                return False
            if wave_file.getframerate() not in [16000, 22050]:
                return False
        return True
    except:
        return False

def get_dataset_duration(wav_path):
    totalduration = 0
    valid_count = 0
    invalid_files = []
    hidden_files = []
    
    for file_name in os.listdir(wav_path):
        if file_name.lower().endswith('.wav'):
            if file_name.startswith('._'):
                hidden_files.append(file_name)
                continue
            
            full_path = os.path.join(wav_path, file_name)
            if is_valid_wav(full_path):
                try:
                    with wave.open(full_path, "rb") as wave_file:
                        frames = wave_file.getnframes()
                        rate = wave_file.getframerate()
                        duration = frames / float(rate)
                        totalduration += duration
                        valid_count += 1
                except Exception as e:
                    print(f"Error processing {file_name}: {str(e)}")
                    invalid_files.append(file_name)
            else:
                print(f"Invalid WAV file: {file_name}")
                invalid_files.append(file_name)
    
    duration_str = str(datetime.timedelta(seconds=round(totalduration, 0)))
    return valid_count, duration_str, invalid_files, hidden_files

def zip_wav_files(wav_path, zip_path):
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(wav_path):
            for file in files:
                if file.lower().endswith('.wav') and not file.startswith('._'):
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, wav_path)
                    zipf.write(file_path, arcname)
    print(f"WAV files zipped to {zip_path}")

# Usage
wav_path = "./wav"
zip_path = "./wav_files.zip"

audio_count, dataset_dur, invalid_files, hidden_files = get_dataset_duration(wav_path)

print(f"Processed {audio_count} valid WAVs with total duration {dataset_dur}.")

if invalid_files:
    print(f"\nFound {len(invalid_files)} invalid or problematic files:")
    for file in invalid_files:
        print(f"  - {file}")

if hidden_files:
    print(f"\nFound {len(hidden_files)} hidden macOS files:")
    for file in hidden_files:
        print(f"  - {file}")

print("\nRecommendations:")
if hidden_files:
    print("1. Remove the hidden macOS files (starting with '._') as they are not actual WAV files.")
if invalid_files:
    print("2. Check and correct the invalid WAV files to ensure they are mono, 16-bit, and either 16000 or 22050 Hz.")
print("3. After cleaning up the files, run this script again to verify the dataset.")

# Optional: Remove hidden files
should_remove = input("\nDo you want to remove the hidden macOS files? (yes/no): ").lower().strip()
if should_remove == 'yes':
    removed_count = 0
    for file in hidden_files:
        try:
            os.remove(os.path.join(wav_path, file))
            removed_count += 1
        except Exception as e:
            print(f"Error removing {file}: {str(e)}")
    print(f"Removed {removed_count} hidden files.")
    print("Please run the script again to verify the cleaned dataset.")

# Zip WAV files
zip_wav_files(wav_path, zip_path)
print(f"WAV files have been zipped to {zip_path}")