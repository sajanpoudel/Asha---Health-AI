// src/hooks/useVoiceRecognition.ts
import { useState, useEffect, useRef } from "react";

const useVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [isWaitingForWakeWord, setIsWaitingForWakeWord] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const currentTranscript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(" ")
          .trim()
          .toLowerCase();
        console.log("Detected speech:", currentTranscript);
        setTranscript(currentTranscript);
        setShowTranscript(true);

        if (isWaitingForWakeWord) {
          if (currentTranscript.includes("hey asha") || currentTranscript.includes("hey aasha") || currentTranscript.includes("hello")) {
            console.log("Wake word detected!");
            setIsWaitingForWakeWord(false);
            setTranscript("Listening for your question...");
          }
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        console.log("Speech recognition ended");
        if (!isWaitingForWakeWord) {
          startListening();
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };
    } else {
      console.log("Speech recognition is not supported in this browser");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [isWaitingForWakeWord]);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
      console.log("Started listening");
      if (isWaitingForWakeWord) {
        setTranscript("Listening for wake word...");
      } else {
        setTranscript("Listening for your question...");
      }
      setShowTranscript(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      console.log("Stopped listening");
      setIsWaitingForWakeWord(true);
      setTranscript("");
      setShowTranscript(false);
    }
  };

  return {
    isListening,
    isWaitingForWakeWord,
    transcript,
    showTranscript,
    startListening,
    stopListening,
  };
};

export default useVoiceRecognition;