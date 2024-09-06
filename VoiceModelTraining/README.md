# Voice model training data

Scripts that prepare a voice dataset for a text to speech model. Run them in this order.

1. `audio_download_create_wav_files.py <youtube url>` downloads the audio, converts it to 22050 Hz mono WAV and cuts it into 18 second segments in `wav/`.
2. `rename_wav_files.py` renumbers the files in `wav/` as `1.wav`, `2.wav`, ... and converts them to 16000 Hz mono, 16 bit.
3. `process_wav_files_to_remove_wav_errors.py` checks every file, reports invalid and hidden macOS files, and zips the clean set to `wav_files.zip`.
4. `transcript.py` transcribes each file with Whisper and writes `transcript.txt` in the `wavs/<file>|<text>` format.

## Requirements

`ffmpeg` on your path and these Python packages:

```
pip install yt-dlp pydub librosa soundfile openai-whisper pytest
```

## Tests

```
pytest
```
