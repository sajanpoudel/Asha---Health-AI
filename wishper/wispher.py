from flask import Flask, request, jsonify
import whisper
from flask_cors import CORS
import tempfile
import os

app = Flask(__name__)
CORS(app)

# Load the Whisper model
model = whisper.load_model("base")

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    
    audio_file = request.files['audio']
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
        audio_file.save(temp_audio.name)
        temp_audio_path = temp_audio.name

    try:
        result = model.transcribe(temp_audio_path)
        transcription = result["text"]
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        os.unlink(temp_audio_path)
    
    return jsonify({"transcription": transcription})

if __name__ == '__main__':
    app.run(debug=True, port=5000)