import { useState, useEffect, useRef } from 'react';

const useSpeechRecognition = (handleAiResponse: (message: string) => Promise<void>) => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isWaitingForWakeWord, setIsWaitingForWakeWord] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = async (event: SpeechRecognitionEvent) => {
        const currentTranscript = event.results[0][0].transcript.trim().toLowerCase();
        setTranscript(currentTranscript);
        setShowTranscript(true);

        if (isWaitingForWakeWord) {
          if (currentTranscript.includes('hey asha')) {
            setIsWaitingForWakeWord(false);
            setTranscript('Listening for your question...');
            startListening();
          }
        } else {
          stopListening();
          await handleAiResponse(currentTranscript);
          setIsWaitingForWakeWord(true);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (isWaitingForWakeWord) {
          setTimeout(startListening, 1000);
        }
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        if (isWaitingForWakeWord) {
          setTimeout(startListening, 1000);
        }
      };

      startListening();
    } else {
      console.log('Speech recognition is not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isWaitingForWakeWord, handleAiResponse]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakText = (text: string) => {
    setIsSpeaking(true);
    const speech = new SpeechSynthesisUtterance(text);
    speech.onend = () => {
      setIsSpeaking(false);
      startListening();
    };
    window.speechSynthesis.speak(speech);
  };

  return {
    transcript,
    isListening,
    isSpeaking,
    isWaitingForWakeWord,
    showTranscript,
    setShowTranscript,
    startListening,
    stopListening,
    speakText
  };
};

export default useSpeechRecognition;