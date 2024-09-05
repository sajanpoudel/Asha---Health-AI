import { useState } from 'react';
import { prepareTextForSpeech } from '../utils/textProcessing';

const usePiper = (emotionalTone: string, voiceStyle: string) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speakText = async (text: string) => {
    setIsSpeaking(true);
    try {
      const processedText = prepareTextForSpeech(text);
      console.log("Processed text for speech:", processedText); // For debugging

      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: processedText,
          emotion: emotionalTone,
          voiceStyle: voiceStyle
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate speech: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('Error playing speech:', error);
      setIsSpeaking(false);
    }
  };

  return {
    isSpeaking,
    speakText,
  };
};

export default usePiper;
