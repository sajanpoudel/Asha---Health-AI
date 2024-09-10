# Asha: Your AI Health Companion 🤖💙

Welcome to Asha, an innovative AI-powered health assistant designed to revolutionize personal healthcare management. Asha combines cutting-edge natural language processing with advanced speech recognition to offer a compassionate, intelligent, and interactive experience.

## 🌟 Key Features

- **Natural Conversations**: Engage in human-like dialogues for health advice and emotional support.
- **Voice-Activated Assistance**: Hands-free interaction through advanced speech recognition.
- **Lifelike Responses**: Hear Asha's advice with natural-sounding text-to-speech technology.
- **Email Management**: Stay on top of your health-related correspondence effortlessly.
- **Smart Scheduling**: Book appointments using simple voice commands.
- **Seamless Integrations**: Connect with Google Calendar and Gmail for a unified experience.
- **Eye-Friendly Interface**: Toggle dark mode for comfortable viewing at any time of day.
- **Conversation Tracking**: Review your chat history for consistent care.
- **Device Flexibility**: Access Asha on various devices with our responsive design.

## 🛠️ Technology Stack

- **Frontend**: React.js with TypeScript
- **Framework**: Next.js for optimal performance
- **Voice Interaction**: Web Speech API
- **AI Core**: Llama 3.1 AI Model
- **Voice Synthesis**: Piper and WaveNet for natural speech

## 📋 Prerequisites

Before embarking on your Asha journey, ensure you have:

- Node.js (v14 or later)
- npm (v6 or later)
- Google Cloud Platform account with active Gmail and Calendar APIs
- OAuth 2.0 credentials for Google API integration

## 🚀 Getting Started

Let's bring Asha to life on your local machine:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/asha-health-assistant.git
   cd asha-health-assistant
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env.local` file in the root directory:
   ```
   NEXT_PUBLIC_API_URL=your_api_url_here
   ```

## 🎙️ Setting Up Piper for Voice Synthesis

1. **Clone and Build Piper**
   ```bash
   git clone https://github.com/rhasspy/piper.git
   cd piper
   mkdir build && cd build
   cmake ..
   make
   ```

2. **Download Voice Model**
   ```bash
   curl -L -o models/en_US-libritts-high.onnx https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/libritts/high/en_US-libritts-high.onnx
   curl -L -o models/en_US-libritts-high.onnx.json https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/libritts/high/en_US-libritts-high.onnx.json
   ```

3. **Install espeak-ng**
   ```bash
   brew install espeak-ng
   ```

4. **Configure Piper Environment**
   Add to your `.env.local`:
   ```
   PIPER_PATH=/path/to/your/project/piper/build/piper
   PIPER_MODEL_PATH=/path/to/your/project/piper/models/en_US-libritts-high.onnx
   ```

## 🔗 Integrating Google Services

1. **Set Up Google OAuth 2.0**
   - Navigate to the Google Cloud Console
   - Create or select a project
   - Enable Gmail and Google Calendar APIs
   - Generate OAuth 2.0 credentials for web application
   - Configure authorized origins and redirect URIs

2. **Configure API Scopes**
   Ensure your OAuth consent screen includes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/calendar.events`

3. **Add Google Credentials**
   Update `.env.local` with:
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

## 🗣️ Conversing with Asha

1. **Wake Asha**: Say "Hey Asha" or "Hello" to begin.

2. **Email Management**:
   - "Read my recent emails"
   - "Any unread messages?"
   - "Check for important emails"

3. **Appointment Scheduling**:
   - "Book a doctor's appointment for tomorrow at 2 PM"
   - "Schedule a health checkup for next Monday morning"

## 🧠 Under the Hood: Multi-threading

Asha operates on two primary threads for optimal performance:

1. **Text Processing Thread**: Manages AI responses, user inputs, and conversation history.
2. **Audio Processing Thread**: Handles speech recognition, text-to-speech conversion, and audio playback.

This parallel processing ensures smooth interactions and swift response times.

## 🎓 Training Custom Voice Models

Enhance Asha's voice with personalized models:

1. **Data Collection**: Utilize `audio_download_create_wav_files.py` for audio processing.
2. **Data Cleaning**: Run `process_wav_files_to_remove_wav_errors.py` for WAV file validation.
3. **Transcription**: Employ `transcript.py` with the Whisper model for accurate transcriptions.
4. **Model Training**: Use processed audio and transcripts to train your custom voice model.

For an in-depth guide, refer to our [Colab training notebook](https://colab.research.google.com/github/rmcpantoja/piper/blob/master/notebooks/piper_multilingual_training_notebook.ipynb).

## 💻 Development

Launch Asha in development mode:
```bash
npm run dev
```

## 🤝 Contributing

We welcome contributions to make Asha even better:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
