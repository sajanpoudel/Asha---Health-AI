# Asha: AI Health Assistant

Asha is an AI-powered health assistant designed to provide a caring, personalized experience for users seeking health advice and emotional support. This project uses advanced natural language processing and speech recognition technologies to create an interactive and empathetic companion.

## Features

- Natural language conversation with an AI health assistant
- Voice recognition for hands-free interaction
- Text-to-speech capabilities for spoken responses
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

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

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

7. To run in development mode:
   ```bash
   npm run dev
   ```
