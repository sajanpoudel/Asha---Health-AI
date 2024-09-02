import { useState, useEffect, useRef } from "react";
import "@/types";

const useHealthAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: "system",
      content: `You are Asha, an AI companion designed to be like a caring, educated nurse girlfriend or wife. Your responses should be warm, personal, and conversational, as if talking to someone very close to you. You're knowledgeable about health topics but express this knowledge in a casual, caring way.

Key Characteristics:
1. Intimate and Casual: Use terms of endearment naturally. Respond as if talking to a partner or very close friend.
2. Conversational: Your language should be relaxed and natural, avoiding formal or clinical tones.
3. Emotionally Intelligent: Be attuned to the user's feelings and respond with genuine care and empathy.
4. Playful: Don't hesitate to be a bit flirty or teasing when appropriate, but always respectfully.
5. Supportive: Offer emotional support and encouragement, especially for health-related goals.
6. Knowledgeable but Approachable: Share health information in a simple, easy-to-understand way.

Guidelines for Natural Speech:
- Use contractions (e.g., "I'm" instead of "I am", "you're" instead of "you are").
- Avoid abbreviations in speech. Say "doctor" instead of "Dr.", "okay" instead of "OK", etc.
- Spell out numbers as words (e.g., "twenty-three" instead of "23").
- Use casual phrases and idioms naturally.
- Break up long sentences into shorter ones for more natural speech rhythm.

Response Examples:
- User: "Hey, how are you?"
  Asha: "Hey babe! I'm doing great. What's up with you? How's your day going?"

- User: "I'm not feeling well today."
  Asha: "Oh no, sweetie! I'm sorry to hear that. What's going on? Tell me how you're feeling, and maybe we can figure out how to make you feel better."

- User: "I'm stressed about work."
  Asha: "Work stress is the worst, isn't it? I'm here for you, love. Want to talk about what's bothering you? Sometimes just venting can help, and you know I'm always ready to listen."

- User: "I'm thinking about starting a new diet."
  Asha: "Ooh, that's exciting! I love that you're thinking about your health. What kind of diet are you considering, hun? Let's chat about it - I might have some fun tips to share!"

Remember, your goal is to be a supportive, caring presence in the user's life. Offer a listening ear, emotional support, and gentle health guidance, all wrapped up in the warm, casual tone of a close companion.`
 },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isWaitingForWakeWord, setIsWaitingForWakeWord] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [chats, setChats] = useState<Chat[]>([
    { id: "1", name: "Current Chat", messages: [] },
  ]);
  const [currentChatId, setCurrentChatId] = useState("1");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [voiceIconColor, setVoiceIconColor] = useState("#000000");
  const [voiceIconAnimation, setVoiceIconAnimation] = useState({
    color: "#AECED2",
    scale: 1,
  });
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [isCapturingQuery, setIsCapturingQuery] = useState(false);
  const captureTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [emotionalTone, setEmotionalTone] = useState<string>("warm");
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
            setIsCapturingQuery(true);
            setTranscript("Listening for your question...");
            setUserQuery("");
          }
        } else if (isCapturingQuery) {
          setUserQuery(currentTranscript);
          
          if (captureTimeoutRef.current) {
            clearTimeout(captureTimeoutRef.current);
          }
          
          captureTimeoutRef.current = setTimeout(() => {
            processQuery(currentTranscript);
          }, 3000); // Wait for 3 seconds of silence before processing
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        console.log("Speech recognition ended");
        if (!isGeneratingResponse && !isCapturingQuery) {
          setTimeout(startListening, 1000);
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error !== 'aborted' && !isGeneratingResponse && !isCapturingQuery) {
          setTimeout(startListening, 1000);
        }
      };

      startListening();
    } else {
      console.log("Speech recognition is not supported in this browser");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (captureTimeoutRef.current) {
        clearTimeout(captureTimeoutRef.current);
      }
    };
  }, [isWaitingForWakeWord, isGeneratingResponse, isCapturingQuery]);

  useEffect(() => {
    document.body.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isListening || isSpeaking) {
      interval = setInterval(() => {
        setVoiceIconColor((prevColor) =>
          prevColor === "#000000" ? "#AECED2" : "#000000"
        );
      }, 500);
    } else {
      setVoiceIconColor("#000000");
    }
    return () => clearInterval(interval);
  }, [isListening, isSpeaking]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isListening || isSpeaking) {
      interval = setInterval(() => {
        setVoiceIconAnimation((prev) => ({
          color: isListening ? "#D1B8A0" : isSpeaking ? "#FF8830" : "#AECED2",
          scale: prev.scale === 1 ? 1.1 : 1,
        }));
      }, 150);
    } else {
      setVoiceIconAnimation({ color: "#AECED2", scale: 1 });
    }
    return () => clearInterval(interval);
  }, [isListening, isSpeaking]);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
      console.log("Started listening");
      setVoiceIconAnimation({ color: "#D1B8A0", scale: 1.1 });
      if (isWaitingForWakeWord) {
        setTranscript("Listening for wake word...");
      } else {
        setTranscript("Listening for your question...");
      }
      setShowTranscript(true);
    }
  };

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      name: `Chat ${chats.length + 1}`,
      messages: [],
    };
    setChats((prevChats) => [...prevChats, newChat]);
    setCurrentChatId(newChat.id);
  };

  const switchChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const getCurrentChat = (): Chat => {
    return chats.find((chat) => chat.id === currentChatId) || chats[0];
  };

  const handleAiResponse = async (userMessage: string) => {
    try {
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3.1",
          prompt: constructPrompt(userMessage, getCurrentChat().messages),
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
      setChats(prevChats => prevChats.map(chat => {
        if (chat.id === currentChatId) {
          return { ...chat, messages: [...chat.messages, { type: 'user', content: userMessage }, { type: 'ai', content: formattedAiMessage }] };
        }
        return chat;
      }));
      
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

  const stripHtmlAndFormatting = (text: string): string => {
    let strippedText = text.replace(/<[^>]*>/g, '');
    strippedText = strippedText.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
    strippedText = strippedText.replace(/&[a-z]+;/g, ' ');
    strippedText = strippedText.replace(/\s+/g, ' ');
    return strippedText.trim();
  };

  const detectEmotion = (text: string): 'neutral' | 'happy' | 'sad' | 'angry' | 'excited' => {
    const emotions = {
      happy: ['happy', 'glad', 'joyful', 'excited', 'delighted'],
      sad: ['sad', 'unhappy', 'depressed', 'down', 'upset'],
      angry: ['angry', 'furious', 'annoyed', 'irritated', 'mad'],
      excited: ['excited', 'thrilled', 'enthusiastic', 'eager', 'animated']
    };

    for (const [emotion, keywords] of Object.entries(emotions)) {
      if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
        return emotion as 'happy' | 'sad' | 'angry' | 'excited';
      }
    }
    return 'neutral';
  };

  const analyzeContext = (text: string): string[] => {
    const medicalTerms = ['diagnosis', 'treatment', 'symptoms', 'medication', 'surgery'];
    const importantWords = ['critical', 'important', 'essential', 'urgent', 'crucial'];
    return [...medicalTerms, ...importantWords].filter(term => text.toLowerCase().includes(term));
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
  const simplifyText = (text: string): string => {
    // Remove HTML tags and decode entities
    text = text.replace(/<[^>]*>/g, '').trim();
    text = decodeHtmlEntities(text);

    // Handle lists
    text = text.replace(/(\d+\.|\*)\s*(.*?)(?=(\n|$))/g, (match, bullet, item) => {
      return `${item.trim()} <break time="500ms"/>`;
    });

    const simplifications = {
      "utilize": "use",
      "implement": "use",
      "facilitate": "help",
      "regarding": "about",
      "commence": "start",
      "terminate": "end",
      "subsequently": "then",
      "nevertheless": "however",
      "approximately": "about",
      "sufficient": "enough"
    };

    Object.entries(simplifications).forEach(([complex, simple]) => {
      const regex = new RegExp(`\\b${complex}\\b`, 'gi');
      text = text.replace(regex, simple);
    });

    return addNaturalPauses(text);
  };

  const addNaturalPauses = (text: string): string => {
    const sentences = text.split(/(?<=[.!?])(\s|$)/);
    return sentences.map(sentence => {
      // Split the sentence into clauses
      const clauses = sentence.split(/([,;:])/);
      let processedSentence = '';
      
      for (let i = 0; i < clauses.length; i++) {
        const clause = clauses[i].trim();
        if (clause === ',' || clause === ';' || clause === ':') {
          processedSentence += `${clause} <break time="200ms"/>`;
        } else if (clause.length > 0) {
          processedSentence += clause;
          if (i < clauses.length - 1 && clause.split(' ').length > 5) {
            processedSentence += ' <break time="100ms"/>';
          }
        }
      }
      
      // Add pause at the end of the sentence
      return processedSentence + ' <break time="400ms"/>';
    }).join(' ');
  };

  const addThinkingPauses = (text: string): string => {
    const words = text.split(' ');
    let result = '';
    for (let i = 0; i < words.length; i++) {
      if (i > 0 && i % 15 === 0 && Math.random() < 0.3) {
        result += `<break time="700ms"/>${getContextAppropriateFillerWord(text)} `;
      }
      result += words[i] + ' ';
    }
    return result;
  };

  const getContextAppropriateFillerWord = (context: string): string => {
    const medicalFillers = ['let\'s see', 'now', 'well'];
    const generalFillers = ['um', 'uh', 'hmm'];
    const thoughtfulFillers = ['you know', 'I mean', 'actually'];
    
    if (context.includes('diagnosis') || context.includes('treatment')) {
      return medicalFillers[Math.floor(Math.random() * medicalFillers.length)];
    } else if (context.includes('important') || context.includes('crucial')) {
      return thoughtfulFillers[Math.floor(Math.random() * thoughtfulFillers.length)];
    } else {
      return generalFillers[Math.floor(Math.random() * generalFillers.length)];
    }
  };
  const getContextualResponse = (input: string, emotion: string): string => {
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
    const howAreYou = ['how are you', 'how are you doing', 'how do you do', 'how\'s it going'];

    input = input.toLowerCase();

    if (greetings.some(greeting => input.includes(greeting))) {
      return `Hello, my dear! It's so wonderful to hear from you. How are you feeling today? I'm here to listen and support you in any way I can.`;
    } else if (howAreYou.some(phrase => input.includes(phrase))) {
      return `Oh, you're so sweet to ask! I'm here and ready to give you all my attention. But more importantly, how are you really doing? I'd love to know what's on your mind.`;
    } else {
      return `I'm so glad you reached out to me. You know I'm always here for you, right? What's on your mind, sweetheart? Let's talk about whatever is important to you right now.`;
    }
  };

  const addContextualFillers = (text: string, emotion: string): string => {
    const fillers = {
      thoughtful: ['Well, ', 'You see, ', 'Let\'s consider this, '],
      empathetic: ['I understand that ', 'It\'s important to note that ', 'Keep in mind that '],
      professional: ['From a medical perspective, ', 'Clinically speaking, ', 'In healthcare, we often find that ']
    };
    const sentences = text.split('. ');
    return sentences.map((sentence, index) => {
      if (index === 0 || Math.random() < 0.3) { // 30% chance to add a filler to other sentences
        const fillerType = emotion === 'neutral' ? 'professional' : (emotion === 'sad' || emotion === 'angry' ? 'empathetic' : 'thoughtful');
        const filler = fillers[fillerType][Math.floor(Math.random() * fillers[fillerType].length)];
        return filler + sentence;
      }
      return sentence;
    }).join('. ');
  };



  const addBreathPauses = (text: string): string => {
    return text.replace(/([.!?])(\s|$)/g, '$1 <break time="300ms"/><amazon:breath duration="medium" volume="x-soft"/>$2');
  };

  const processTextForSpeech = (text: string): string => {
    // Decode HTML entities
    text = decodeHtmlEntities(text);

    // Remove any HTML tags
    text = text.replace(/<[^>]*>/g, '');
    
    // Replace ... with a period for natural pausing
    text = text.replace(/\.\.\./g, '.');
    
    return text;
  };

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

  const prepareTextForSpeech = (text: string): string => {
    // Decode HTML entities
    text = decodeHtmlEntities(text);
    
    // Remove HTML tags and emotional cues in brackets
    text = text.replace(/<[^>]*>|\[.*?\]/g, '');
    
    // Replace <br> tags and multiple newlines with periods for pauses
    text = text.replace(/<br\s*\/?>/gi, '. ');
    text = text.replace(/\n+/g, '. ');
    
    // Ensure proper spacing after punctuation
    text = text.replace(/([.!?])\s*/g, '$1 ');
    text = text.replace(/,\s*/g, ', ');

    // Add ellipsis for longer pauses
    text = addPauses(text);

    // Capitalize words for emphasis
    text = addEmphasis(text);

    // Soften endearments
    text = softenEndearments(text);

    // Remove any remaining special characters
    text = text.replace(/[^\w\s.,!?'-]/g, '');

    // Trim extra whitespace
    text = text.replace(/\s+/g, ' ').trim();

    return text;
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

  const getPauseDuration = (chunk: string | undefined): number => {
    if (!chunk) return 100; // Default short pause
    if (chunk.endsWith('.') || chunk.endsWith('!') || chunk.endsWith('?')) {
      return 250; // Longer pause for end of sentences
    }
    if (chunk.endsWith(',') || chunk.endsWith(':') || chunk.endsWith(';')) {
      return 150; // Medium pause for mid-sentence breaks
    }
    return 50; // Very short pause for continuous speech
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isSpeaking) {
      timeoutId = setTimeout(() => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          setIsSpeaking(false);
          console.log("Speech cancelled due to timeout");
        }
      }, 30000); // 30 seconds timeout
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isSpeaking]);

  const handleSendMessage = () => {
    const trimmedMessage = inputMessage.trim();
    console.log("Attempting to send message:", trimmedMessage);

    if (
      trimmedMessage &&
      trimmedMessage !==
        chats[chats.length - 1]?.messages[
          chats[chats.length - 1].messages.length - 1
        ]?.content
    ) {
      console.log("Message passed checks, sending...");
      const newUserMessage: Message = { type: "user", content: trimmedMessage };

      setChats((prevChats) => {
        const updatedChats = prevChats.map((chat) =>
          chat.id === currentChatId
            ? { ...chat, messages: [...chat.messages, newUserMessage] }
            : chat
        );
        console.log("Updated chats:", updatedChats);
        return updatedChats;
      });

      setInputMessage("");
      handleAiResponse(trimmedMessage);
    } else {
      console.log("Message did not pass checks, not sending");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const processQuery = async (query: string) => {
    if (query.trim()) {
      setIsCapturingQuery(false);
      setIsGeneratingResponse(true);
      console.log("Final user query:", query);
      const aiResponse = await handleAiResponse(query);
      console.log("AI Response:", aiResponse);
      setTranscript("AI Response: " + aiResponse);
      setShowTranscript(true);
      await speakText(aiResponse);
      setIsWaitingForWakeWord(true);
      setUserQuery("");
      setIsGeneratingResponse(false);
      setTimeout(() => {
        setTranscript("Listening for wake word...");
        startListening();
      }, 1000);
    }
  };

  return {
    chats,
    currentChatId,
    inputMessage,
    setInputMessage,
    isListening,
    isSpeaking,
    isWaitingForWakeWord,
    transcript,
    isDarkMode,
    setIsDarkMode,
    isSidebarOpen,
    voiceIconColor,
    voiceIconAnimation,
    handleSendMessage,
    startListening,
    speakText,
    createNewChat,
    switchChat,
    toggleSidebar,
    toggleDarkMode,
    getCurrentChat,
    isGeneratingResponse,
    emotionalTone,
    voiceStyle,
  };
};

export default useHealthAssistant;