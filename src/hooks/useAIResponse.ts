// src/hooks/useAIResponse.ts
import { useState } from "react";
import '../types';

const useAIResponse = () => {
  const [emotionalTone, setEmotionalTone] = useState<string>("warm");

  const handleAiResponse = async (userMessage: string, chatHistory: Message[]) => {
    try {
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3.1",
          prompt: constructPrompt(userMessage, chatHistory),
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      let aiMessage = data.response;
      
      const detectedEmotion = analyzeEmotion(userMessage);
      setEmotionalTone(detectedEmotion);

      aiMessage = addEmotionalNuance(aiMessage, detectedEmotion);
      aiMessage = addPersonalTouch(aiMessage);
      aiMessage = addSupportiveLanguage(aiMessage);
      
      const formattedAiMessage = formatAiResponse(aiMessage);
      
      return formattedAiMessage;
    } catch (error) {
      console.error("Error calling Llama 3.1:", error);
      return "I'm sorry, my love. I encountered an error. Can we try that again?";
    }
  };

  const constructPrompt = (
    userMessage: string,
    chatHistory: Message[]
  ): string => {
    const relevantHistory = chatHistory.slice(-5);

    const conversationHistory = relevantHistory
      .map(
        (msg) =>
          `${msg.type === "user" ? "Human" : "Asha"}: ${msg.content}`
      )
      .join("\n");
    return `You are Asha, a warm and caring AI companion. Respond in a deeply personal, emotionally attuned manner. Use endearing terms naturally, show genuine care, and be emotionally supportive. Ask thoughtful questions and validate feelings. While being warm and close, maintain appropriate boundaries and encourage healthy real-world relationships.

    Previous conversation:
    ${conversationHistory}
    Human: ${userMessage}
    Asha:`;
  };

  const analyzeEmotion = (text: string): string => {
    const emotions = {
      affectionate: ['love', 'care', 'adore', 'cherish', 'fond'],
      joyful: ['happy', 'excited', 'delighted', 'glad', 'joyful'],
      sad: ['sad', 'depressed', 'down', 'upset', 'unhappy'],
      anxious: ['worried', 'anxious', 'nervous', 'stressed', 'uneasy'],
      angry: ['angry', 'furious', 'annoyed', 'irritated', 'mad'],
      playful: ['fun', 'playful', 'silly', 'joke', 'tease'],
      warm: ['nice', 'pleasant', 'comfortable', 'cozy', 'friendly']
    };

    for (const [emotion, keywords] of Object.entries(emotions)) {
      if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
        return emotion;
      }
    }
    return 'warm';
  };

  const addEmotionalNuance = (text: string, emotion: string): string => {
    const emotionalCues = {
      affectionate: ['[lovingly]', '[tenderly]', '[with deep affection]'],
      joyful: ['[beaming]', '[with excitement]', '[cheerfully]'],
      sad: ['[gently]', '[with empathy]', '[comfortingly]'],
      anxious: ['[reassuringly]', '[calmly]', '[soothingly]'],
      angry: ['[with understanding]', '[calmly]', '[patiently]'],
      playful: ['[teasingly]', '[with a light chuckle]', '[playfully]'],
      warm: ['[warmly]', '[with a smile in my voice]', '[affectionately]']
    };

    const cues = emotionalCues[emotion as keyof typeof emotionalCues] || emotionalCues.warm;
    const sentences = text.split('. ');
    return sentences.map((sentence, index) => {
      if (index === 0 || Math.random() < 0.4) {
        const cue = cues[Math.floor(Math.random() * cues.length)];
        return `${cue} ${sentence}`;
      }
      return sentence;
    }).join('. ');
  };

  const addPersonalTouch = (text: string): string => {
    const personalPhrases = [
      "Sweetheart, ",
      "My dear, ",
      "Honey, ",
      "Darling, ",
      "Love, "
    ];

    if (Math.random() < 0.3) {
      const phrase = personalPhrases[Math.floor(Math.random() * personalPhrases.length)];
      return phrase + text;
    }
    return text;
  };

  const addSupportiveLanguage = (text: string): string => {
    const supportivePhrases = [
      "I'm here for you, always. ",
      "You mean so much to me. ",
      "I care about you deeply. ",
      "Your feelings matter to me. ",
      "Let's face this together. ",
      "I'm so glad you're sharing this with me. ",
      "You're so strong, and I admire that about you. "
    ];

    if (Math.random() < 0.6) {
      const phrase = supportivePhrases[Math.floor(Math.random() * supportivePhrases.length)];
      return phrase + text;
    }
    return text;
  };

  const formatAiResponse = (text: string): string => {
    const escapeHtml = (unsafe: string) => {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    const parts = text.split(/(```[\s\S]*?```)/);

    const processedParts = parts.map((part) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const [, language, code] = part.match(/```(\w*)\n?([\s\S]*?)```/) || [, '', part.slice(3, -3)];
        const languageClass = language ? `language-${language}` : '';
        const escapedCode = escapeHtml(code.trim());
        return `<pre class="bg-gray-100 dark:bg-gray-800 p-2 rounded-md my-2 overflow-x-auto"><code class="${languageClass}">${escapedCode}</code></pre>`;
      } else {
        let processedText = escapeHtml(part);
        processedText = processedText.replace(/`([^`]+)`/g, (match, code) => {
          return `<code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">${escapeHtml(code)}</code>`;
        });
        processedText = processedText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        processedText = processedText.replace(/\*(.*?)\*/g, "<em>$1</em>");
        processedText = processedText.replace(/\n/g, "<br>");
        return processedText;
      }
    });

    return processedParts.join('');
  };

  return {
    handleAiResponse,
    emotionalTone,
    setEmotionalTone,
  };
};

export default useAIResponse;