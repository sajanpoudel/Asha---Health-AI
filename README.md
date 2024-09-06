# Asha: AI Health Assistant

Asha is an AI-powered health assistant designed to provide a caring, personalized experience for users seeking health advice and emotional support. This project uses advanced natural language processing and speech recognition technologies to create an interactive and empathetic companion.

## Features

- Natural language conversation with an AI health assistant
- Voice recognition for hands-free interaction
- Text-to-speech capabilities for spoken responses
- Email reading functionality
- Appointment booking through voice commands
- Integration with Google Calendar and Gmail
- Dark mode for comfortable viewing
- Chat history management
- Responsive design for various devices

## Technologies Used

- React.js
- TypeScript
- Next.js
- Web Speech API
- Llama 3.1 AI Model
- Piper
- WaveNet

## Prerequisites

Before you begin, ensure you have met the following requirements:


- Node.js (v14 or later)
- npm (v6 or later)
- A Google Cloud Platform account with Gmail and Calendar APIs enabled
- OAuth 2.0 credentials for Google APIs

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/asha-health-assistant.git

   ```

2. Navigate to the project directory:
   ```
   cd asha-health-assistant
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Create a `.env.local` file in the root directory and add any necessary environment variables:
   ```
   NEXT_PUBLIC_API_URL=your_api_url_here
   ```

## Piper Installation and Setup

1. Clone the Piper repository:
   ```bash
   git clone https://github.com/rhasspy/piper.git
   cd piper
   ```

2. Build Piper:
   ```bash
   mkdir build
   cd build
   cmake ..
   make
   ```

3. Download the voice model:
   ```bash
   curl -L -o models/en_US-libritts-high.onnx https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/libritts/high/en_US-libritts-high.onnx
   curl -L -o models/en_US-libritts-high.onnx.json https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/libritts/high/en_US-libritts-high.onnx.json
   ```

4. Install espeak-ng:
   ```bash
   brew install espeak-ng
   ```

5. Set up environment variables:
   Add the following to your `.env.local` file:
   ```bash
   PIPER_PATH=/path/to/your/project/piper/build/piper
   PIPER_MODEL_PATH=/path/to/your/project/piper/models/en_US-libritts-high.onnx
   ```

6. Test Piper:
   ```bash
   echo "Hello, this is a test." | ./build/piper --model ./models/en_US-libritts-high.onnx --output_file test.wav
   ```

## Calender and Gmail Integration Setup

1. Set up Google OAuth 2.0:
   - Go to the Google Cloud Console
   - Create a new project or select an existing one
   - Enable the Gmail API and Google Calendar API
   - Create OAuth 2.0 credentials (Web application type)
   - Add authorized JavaScript origins and redirect URIs for your app
   

2. Configure Google API scopes:
   Ensure your OAuth consent screen includes the following scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/calendar.events`

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following:
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```
## Using Voice Commands To Interact With Google Calendar and Gmail

1. Wake up the assistant by saying "Hey Asha" or "Hello"

2. To read emails, try commands like:
   - "Read my recent emails"
   - "Check my unread emails"
   - "Any important emails?"

3. To book an appointment, use commands like:
   - "Book a doctor appointment for tomorrow at 2 PM"
   - "Schedule a checkup next Monday at 10 AM"

## Contributing

Contributions to the Health Assistant AI project are welcome. Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a pull request

## To run in development mode:
   ```bash
   npm run dev

  ```
## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

