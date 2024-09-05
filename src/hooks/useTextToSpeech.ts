// src/hooks/useTextToSpeech.ts
import { useState, useEffect } from "react";

const useTextToSpeech = (emotionalTone: string) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceStyle, setVoiceStyle] = useState<string>("default");

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    setVoiceVariation(emotionalTone);
  }, [emotionalTone]);

  const speakText = async (text: string) => {
    setIsSpeaking(true);
    try {
      const processedText = prepareTextForSpeech(text);
      console.log("Processed text for speech:", processedText);

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

  const prepareTextForSpeech = (text: string): string => {
    text = decodeHtmlEntities(text);
    text = text.replace(/<[^>]*>|\[.*?\]/g, '');
    text = text.replace(/<br\s*\/?>/gi, '. ');
    text = text.replace(/\n+/g, '. ');
    text = text.replace(/([.!?])\s*/g, '$1 ');
    text = text.replace(/,\s*/g, ', ');
    text = addPauses(text);
    text = addEmphasis(text);
    text = softenEndearments(text);
    text = text.replace(/[^\w\s.,!?'-]/g, '');
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  };

  const decodeHtmlEntities = (text: string): string => {
    const entities: { [key: string]: string } = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#039;': "'",
      '&apos;': "'",
      '&#x27;': "'",
      '&#x2F;': '/',
      '&#32;': ' ',
      '&nbsp;': ' '
    };
    return text.replace(/&[\w\d#]{2,5};/g, entity => entities[entity] || entity);
  };

  const addPauses = (text: string): string => {
    const sentences = text.split(/(?<=[.!?])\s+/);
    return sentences.map((sentence, index) => {
      if (index < sentences.length - 1 && Math.random() < 0.3) {
        return sentence + '...';
      }
      return sentence;
    }).join(' ');
  };

  const addEmphasis = (text: string): string => {
    const emphasizeWords = ['moon', 'sun', 'cosmic', 'adventure', 'stars', 'lunar', 'space', 'universe'];
    const regex = new RegExp(`\\b(${emphasizeWords.join('|')})\\b`, 'gi');
    return text.replace(regex, (match) => match.toUpperCase());
  };

  const softenEndearments = (text: string): string => {
    const endearments = ['Sweetie', 'Darling', 'Sweetheart'];
    endearments.forEach(endearment => {
      const regex = new RegExp(`\\b${endearment}\\b`, 'gi');
      text = text.replace(regex, `${endearment.toLowerCase()}...`);
    });
    return text;
  };

  const setVoiceVariation = (emotion: string) => {
    const variations = {
      affectionate: 'soft',
      joyful: 'happy',
      sad: 'gentle',
      anxious: 'concerned',
      angry: 'calm',
      playful: 'cheerful',
      warm: 'default'
    };

    setVoiceStyle(variations[emotion as keyof typeof variations] || 'default');
  };

  return {
    isSpeaking,
    speakText,
    voices,
    voiceStyle,
    setVoiceStyle,
  };
};

export default useTextToSpeech;