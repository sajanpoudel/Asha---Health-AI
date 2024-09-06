import { useState, useEffect, useRef } from "react";
import "@/types";
import { prompt } from "@/constants/textConstants";
import { handleAppointmentBooking, bookAppointment } from '../utils/appointmentUtils';
import { readEmail } from '../utils/emailUtils';
import { generateLlamaResponse } from '../utils/llamaConfig';
import { constructPrompt } from '../utils/aiUtils';
import { analyzeEmotion, addEmotionalNuance, addPersonalTouch, addSupportiveLanguage } from '../utils/emotionUtils';
import { formatAiResponse, stripHtmlAndFormatting, simplifyText, addNaturalPauses, decodeHtmlEntities } from '../utils/textUtils';

const useHealthAssistant = (accessToken: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: "system",
      content: prompt },
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
  const [isRecognitionActive, setIsRecognitionActive] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [recognitionError, setRecognitionError] = useState("");
  const lastProcessedQuery = useRef<string>("");

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
    initializeSpeechRecognition();
    return cleanupSpeechRecognition;
  }, [isWaitingForWakeWord, isGeneratingResponse, isCapturingQuery]);

  const initializeSpeechRecognition = () => {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      setupSpeechRecognition();
      startListening();
    } else {
      console.log("Speech recognition is not supported in this browser");
    }
  };

  const setupSpeechRecognition = () => {
    if (!recognitionRef.current) return;

    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onresult = handleSpeechResult;
    recognitionRef.current.onend = handleSpeechEnd;
    recognitionRef.current.onerror = handleSpeechError;
  };

  const handleSpeechResult = (event: SpeechRecognitionEvent) => {
    const currentTranscript = Array.from(event.results)
      .map(result => result[0].transcript)
      .join(" ")
      .trim()
      .toLowerCase();
    console.log("Detected speech:", currentTranscript);
    setTranscript(currentTranscript);
    setShowTranscript(true);

    if (isWaitingForWakeWord) {
      checkForWakeWord(currentTranscript);
    } else if (isCapturingQuery) {
      captureUserQuery(currentTranscript);
    }
  };

  const checkForWakeWord = (transcript: string) => {
    if (transcript.includes("hey asha") || transcript.includes("hey aasha") || transcript.includes("hello")) {
      console.log("Wake word detected!");
      setIsWaitingForWakeWord(false);
      setIsCapturingQuery(true);
      setTranscript("Listening for your question...");
      setUserQuery("");
    }
  };

  const captureUserQuery = (transcript: string) => {
    setUserQuery(transcript);
    
    if (captureTimeoutRef.current) {
      clearTimeout(captureTimeoutRef.current);
    }
    
    captureTimeoutRef.current = setTimeout(() => {
      if (transcript.trim() !== lastProcessedQuery.current) {
        processQuery(transcript);
      }
    }, 3000); // Wait for 3 seconds of silence before processing
  };

  const handleSpeechEnd = () => {
    setIsListening(false);
    setIsRecognitionActive(false);
    console.log("Speech recognition ended");
    if (!isGeneratingResponse && !isCapturingQuery) {
      setTimeout(startListening, 1000);
    }
  };

  const handleSpeechError = (event: SpeechRecognitionErrorEvent) => {
    console.error("Speech recognition error:", event.error);
    setIsListening(false);
    setIsRecognitionActive(false);
    if (event.error !== 'aborted' && !isGeneratingResponse && !isCapturingQuery) {
      setTimeout(startListening, 1000);
    }
  };

  const cleanupSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (captureTimeoutRef.current) {
      clearTimeout(captureTimeoutRef.current);
    }
  };

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
    if (recognitionRef.current && !isRecognitionActive) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setIsRecognitionActive(true);
        console.log("Started listening");
        setVoiceIconAnimation({ color: "#D1B8A0", scale: 1.1 });
        if (isWaitingForWakeWord) {
          setTranscript("Listening for wake word...");
        } else {
          setTranscript("Listening for your question...");
        }
        setShowTranscript(true);
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        setIsListening(false);
        setIsRecognitionActive(false);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isRecognitionActive) {
      recognitionRef.current.stop();
      setIsListening(false);
      setIsRecognitionActive(false);
      console.log("Stopped listening");
    }
  };

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      name: `Chat ${chats.length + 1}`,
      messages: []
    };
    setChats([...chats, newChat]);
    setCurrentChatId(newChat.id);
  };

  const switchChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const getCurrentChat = (): Chat => {
    return chats.find(chat => chat.id === currentChatId) || chats[0];
  };

  const handleAiResponse = async (userMessage: string) => {
    try {
      console.log("Received user message:", userMessage);

      if (userMessage.toLowerCase().includes('book') || 
          userMessage.toLowerCase().includes('make') || 
          userMessage.toLowerCase().includes('schedule') && 
          userMessage.toLowerCase().includes('appointment')) {
        const appointmentResponse = await handleAppointmentBooking(userMessage, accessToken);
        updateChatMessages(userMessage, appointmentResponse);
        return appointmentResponse;
      }

      if (userMessage.toLowerCase().includes('email') || 
          userMessage.toLowerCase().includes('mail') || 
          userMessage.toLowerCase().includes('inbox')) {
        console.log("Detected email-related query. Calling readEmail function.");
        let emailQuery = userMessage.toLowerCase();
        
        if (emailQuery.includes('unread') || emailQuery.includes('new')) {
          emailQuery = 'unread';
        } else if (emailQuery.includes('important')) {
          emailQuery = 'important';
        } else if (emailQuery.includes('sent')) {
          emailQuery = 'sent';
        } else if (emailQuery.includes('draft')) {
          emailQuery = 'draft';
        } else {
          emailQuery = 'recent';
        }
        
        let emailData;
        try {
          const emailResponse = await readEmail(accessToken, emailQuery);
          const jsonString = emailResponse.match(/\[.*\]/)?.[0];
          emailData = jsonString ? JSON.parse(jsonString) : [];
        } catch (error) {
          console.error("Failed to parse email response:", error);
          emailData = [];
        }
        
        const getEmailSummary = async (email: any) => {
          const emailContent = `
            Subject: ${email.subject}
            From: ${email.from}
            Preview: ${email.snippet}
          `;
          const summary = await generateLlamaResponse(`Summarize the following email in 2-3 sentences, highlighting the key points. Do not include phrases like "Here is a summary" or "In summary". Just provide the concise summary:\n\n${emailContent}`);
          return summary.trim();
        };
        
        let aiResponse = '';

        if (emailData && emailData.length > 0) {
          const emailSummaries = await Promise.all(emailData.slice(0, 3).map(async (email: any, index: number) => {
            const sender = email.from.match(/<(.+)>/)?.[1] || email.from;
            const summary = await getEmailSummary(email);
            return `Email ${index + 1} was sent by ${sender}. ${summary}`;
          }));

          const emailSummary = emailSummaries.join('\n\n');
          aiResponse = `[warmly] Sweetie, I've checked your emails for you. Here's a detailed summary of your ${emailQuery} emails:\n\n${emailSummary}\n\nWould you like me to elaborate on any of these emails?`;
        }
        else {
          aiResponse = `[gently] I'm sorry, darling. I couldn't find any ${emailQuery} emails at the moment. Is there anything else I can help you with?`;
        }

        console.log("Updating chat with AI response:", aiResponse);
        updateChatMessages(userMessage, aiResponse);
        
        setTranscript("AI Response: " + aiResponse);
        setShowTranscript(true);

        return aiResponse;
      }

      let aiMessage = await generateLlamaResponse(constructPrompt(userMessage, getCurrentChat().messages));
      
      // Extract emotional cues for speech processing
      const emotionalCues = aiMessage.match(/<em>.*?<\/em>/g) || [];
      const emotionTone = emotionalCues.map(cue => cue.replace(/<\/?em>/g, '')).join(' ');
      setEmotionalTone(emotionTone);

      // Format AI response for display (this will remove emotional cues)
      const formattedAiMessage = formatAiResponse(aiMessage);
      
      // Update chat messages with the formatted message (without emotional cues)
      updateChatMessages(userMessage, formattedAiMessage);

      // Process the original message (with emotional cues) for speech
      aiMessage = aiMessage.replace(/\[.*?\]/g, '')
        .replace(/•/g, 'Bullet point:')
        .replace(/\n/g, ' ');
      
      const detectedEmotion = analyzeEmotion(userMessage);

      aiMessage = addEmotionalNuance(aiMessage, detectedEmotion);
      aiMessage = addPersonalTouch(aiMessage);
      aiMessage = addSupportiveLanguage(aiMessage);

      // Return the formatted message for display
      return formattedAiMessage;
    } catch (error) {
      console.error("Error in handleAiResponse:", error);
      return "I'm sorry, I encountered an error. Can we try that again?";
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSendMessage = () => {
    const trimmedMessage = inputMessage.trim();
    if (trimmedMessage && trimmedMessage !== lastProcessedQuery.current) {
      processQuery(trimmedMessage);
      setInputMessage("");
    }
  };

  const processQuery = async (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    if (trimmedQuery === lastProcessedQuery.current) return;
    lastProcessedQuery.current = trimmedQuery;

    setIsGeneratingResponse(true);
    const aiResponse = await handleAiResponse(trimmedQuery);
    
    // The chat messages are now updated within handleAiResponse for all cases
    // So we don't need to update them here
    
    setIsGeneratingResponse(false);
    
    await speakText(aiResponse);

    setIsWaitingForWakeWord(true);
    setIsCapturingQuery(false);
    setUserQuery("");
  };

  const updateChatMessages = (userMessage: string, aiResponse: string) => {
    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === currentChatId) {
        return {
          ...chat,
          messages: [
            ...chat.messages,
            { type: 'user', content: userMessage },
            { type: 'ai', content: aiResponse }
          ]
        };
      }
      return chat;
    }));
  };

  const speakText = async (text: string) => {
    setIsSpeaking(true);
    try {
      const processedText = prepareTextForSpeech(text);
      console.log("Processed text for speech:", processedText);
      console.log("Emotional tone:", emotionalTone);

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
        const errorText = await response.text();
        throw new Error(`Failed to generate speech: ${response.status}. ${errorText}`);
      }

      const audioBlob = await response.blob();
      console.log("Received audio blob:", audioBlob);

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onloadedmetadata = () => {
        console.log("Audio duration:", audio.duration);
      };

      audio.onplay = () => {
        console.log("Audio started playing");
      };

      audio.onended = () => {
        console.log("Audio finished playing");
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = (e) => {
        console.error("Audio error:", e);
      };

      await audio.play();
    } catch (error) {
      console.error('Error in speakText:', error);
      setIsSpeaking(false);
    }
  };

  const prepareTextForSpeech = (text: string): string => {
    // Extract emotional cues
    const emotionalCues = text.match(/\[(.*?)\]|<em>(.*?)<\/em>/g) || [];
    const emotionTone = emotionalCues
      .map(cue => cue.replace(/[\[\]<em>\/]/g, '').trim())
      .join(' ');

    // Remove emotional cues, HTML tags, and parenthetical actions
    text = text.replace(/\[(.*?)\]|<em>.*?<\/em>|\([^)]+\)/g, '');
    text = stripHtmlAndFormatting(text);
    
    // Decode HTML entities
    text = decodeHtmlEntities(text);
    
    // Remove break tags
    text = text.replace(/<break time="\d+ms"\/>/g, '');
    
    // Format numbers
    text = text.replace(/\d+/g, (match) => {
      return formatNumber(parseInt(match));
    });
    
    text = text.replace(/\n+/g, '. ');
    text = text.replace(/([.!?])\s*/g, '$1 ');
    text = text.replace(/,\s*/g, ', ');
    text = text.replace(/[^\w\s.,!?'-]/g, '');
    text = text.replace(/\s+/g, ' ').trim();

    // Set the emotional tone for speech
    setEmotionalTone(emotionTone);

    return text;
  };

  const formatNumber = (num: number): string => {
    const specialNumbers: { [key: number]: string } = {
      1: 'first',
      2: 'second',
      3: 'third',
      4: 'fourth',
      5: 'fifth',
      6: 'sixth',
      7: 'seventh',
      8: 'eighth',
      9: 'ninth',
      10: 'tenth',
      11: 'eleventh',
      12: 'twelfth',
      13: 'thirteenth',
      14: 'fourteenth',
      15: 'fifteenth',
      20: 'twentieth',
      30: 'thirtieth',
      40: 'fortieth',
      50: 'fiftieth',
      60: 'sixtieth',
      70: 'seventieth',
      80: 'eightieth',
      90: 'ninetieth',
      100: 'hundredth',
      1000: 'thousandth',
      1000000: 'millionth',
      1000000000: 'billionth'
    };

    if (num in specialNumbers) {
      return specialNumbers[num];
    }

    if (num < 100) {
      const tens = Math.floor(num / 10);
      const ones = num % 10;
      if (ones === 0) {
        return specialNumbers[num];
      }
      return `${specialNumbers[tens * 10]}-${specialNumbers[ones]}`;
    }

    return num.toString();
  };

  return {
    messages,
    chatHistory,
    inputMessage,
    transcript,
    isListening,
    isWaitingForWakeWord,
    isSpeaking,
    showTranscript,
    chats,
    currentChatId,
    isDarkMode,
    isSidebarOpen,
    voiceIconColor,
    voiceIconAnimation,
    isGeneratingResponse,
    userQuery,
    isCapturingQuery,
    voices,
    emotionalTone,
    voiceStyle,
    isRecognitionActive,
    recognitionError,
    setMessages,
    setChatHistory,
    setInputMessage,
    setTranscript,
    setIsListening,
    setIsWaitingForWakeWord,
    setIsSpeaking,
    setShowTranscript,
    setChats,
    setCurrentChatId,
    setIsDarkMode,
    setIsSidebarOpen,
    setVoiceIconColor,
    setVoiceIconAnimation,
    setIsGeneratingResponse,
    setUserQuery,
    setIsCapturingQuery,
    setVoices,
    setEmotionalTone,
    setVoiceStyle,
    setIsRecognitionActive,
    startListening,
    stopListening,
    createNewChat,
    switchChat,
    getCurrentChat,
    handleAiResponse,
    toggleSidebar,
    handleSendMessage,
    speakText,
    processQuery,
  };
};

export default useHealthAssistant;
