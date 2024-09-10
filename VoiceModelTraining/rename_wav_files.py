import os
from pydub import AudioSegment

def convert_to_wav(input_file, output_file):
    try:
        audio = AudioSegment.from_file(input_file)
        audio = audio.set_frame_rate(16000).set_channels(1).set_sample_width(2)
        audio.export(output_file, format="wav")
        print(f"Converted: {input_file} -> {output_file}")
    except Exception as e:
        print(f"Error converting {input_file}: {str(e)}")

def rename_and_convert_wav_files(folder_path):
    # Get all files in the folder
    all_files = [f for f in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, f))]
    
    # Sort the files based on their current numeric names
    all_files.sort(key=lambda x: int(os.path.splitext(x)[0]) if x.split('.')[0].isdigit() else float('inf'))
    
    # Rename and convert files
    for index, filename in enumerate(all_files, start=1):
        old_path = os.path.join(folder_path, filename)
        new_filename = f"{index}.wav"
        new_path = os.path.join(folder_path, new_filename)
        
        # Convert to proper WAV format
        convert_to_wav(old_path, new_path)
        
        # Remove the original file if it's different from the new file
        if old_path != new_path:
            os.remove(old_path)
        
        print(f"Processed: {filename} -> {new_filename}")

# Path to the wav folder
wav_folder = 'wav'

# Run the renaming and conversion function
rename_and_convert_wav_files(wav_folder)

print("File processing complete.")