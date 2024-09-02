# Health Assistant with Piper TTS Integration

This project integrates Piper Text-to-Speech (TTS) for enhanced voice capabilities.

## Piper Installation and Setup

1. Clone the Piper repository:
   ```
   git clone https://github.com/rhasspy/piper.git
   cd piper
   ```

2. Build Piper:
   ```
   mkdir build
   cd build
   cmake ..
   make
   ```

3. Download the voice model:
   ```
   curl -L -o models/en_US-libritts-high.onnx https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/libritts/high/en_US-libritts-high.onnx
   curl -L -o models/en_US-libritts-high.onnx.json https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/libritts/high/en_US-libritts-high.onnx.json
   ```

4. Install espeak-ng:
   ```
   brew install espeak-ng
   ```

5. Set up environment variables:
   Add the following to your `.env.local` file:
   ```
   PIPER_PATH=/path/to/your/project/piper/build/piper
   PIPER_MODEL_PATH=/path/to/your/project/piper/models/en_US-libritts-high.onnx
   ```

6. Test Piper:
   ```
   echo "Hello, this is a test." | ./build/piper --model ./models/en_US-librit
'/Users/sajanpoudel/Documents/DATA/UCP/Practice/StartUpIdeas/health-assistant/README.md'cat << EOF >> README.md

## Piper Installation and Setup

1. Clone the Piper repository:
   ```
   git clone https://github.com/rhasspy/piper.git
   cd piper
   ```

2. Build Piper:
   ```
   mkdir build
   cd build
   cmake ..
   make
   ```

3. Download the voice model:
   ```
   curl -L -o models/en_US-libritts-high.onnx https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/libritts/high/en_US-libritts-high.onnx
   curl -L -o models/en_US-libritts-high.onnx.json https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/libritts/high/en_US-libritts-high.onnx.json
   ```

4. Install espeak-ng:
   ```
   brew install espeak-ng
   ```

5. Set up environment variables:
   Add the following to your `.env.local` file:
   ```
   PIPER_PATH=/path/to/your/project/piper/build/piper
   PIPER_MODEL_PATH=/path/to/your/project/piper/models/en_US-libritts-high.onnx
   ```

6. Test Piper:
   ```
   echo "Hello, this is a test." | ./build/piper --model ./models/en_US-libritts-high.onnx --output_file test.wav
   ```

