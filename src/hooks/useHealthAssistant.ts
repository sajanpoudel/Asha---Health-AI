import { useState, useEffect, useRef, useCallback } from "react";
import "@/types";
import { prompt } from "@/constants/textConstants";
import { handleAppointmentBooking, bookAppointment } from '../utils/appointmentUtils';
import { readEmail } from '../utils/emailUtils';
import { generateLlamaResponse, generateLlamaResponseStream } from '../utils/llamaConfig';
import { constructPrompt } from '../utils/aiUtils';
import { analyzeEmotion, addEmotionalNuance, addPersonalTouch, addSupportiveLanguage } from '../utils/emotionUtils';
import { formatAiResponse, stripHtmlAndFormatting, simplifyText, addNaturalPauses, decodeHtmlEntities } from '../utils/textUtils';



const useHealthAssistant = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      setAccessToken(storedToken);
    }
  }, []);

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

  const audioQueue = useRef<{ text: string; emotion: string }[]>([]);
  const sentenceBuffer = useRef<string[]>([]);
  const isProcessingAudio = useRef(false);
  const isGeneratingText = useRef(false);
  const [worker, setWorker] = useState<Worker | null>(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const newWorker = new Worker(new URL('../workers/aiWorker.ts', import.meta.url));
      setWorker(newWorker);

      return () => {
        newWorker.terminate();
      };
    }
  }, []);


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
      console.log("Access token:", accessToken);
    



      if (isAppointmentRequest(userMessage)) {
        if (!accessToken) {
          console.error('Access token is missing');
          return "I'm sorry, there was an error with your authentication. Please try logging in again.";
        }
        const response = await handleAppointmentBooking(userMessage, accessToken);
        updateChatMessages(userMessage, response, true);
        await speakText(response);
        return response;
      }

      if (isEmailRequest(userMessage)) {
        if (!accessToken) {
          console.error('Access token is missing');
          return "I'm sorry, there was an error with your authentication. Please try logging in again.";
        }
        const emailQuery = determineEmailQueryType(userMessage);
        const emailData = await fetchEmailData(accessToken, emailQuery);
        const response = await generateDetailedEmailResponse(emailData, emailQuery);
        updateChatMessages(userMessage, response, true);
        await speakText(response);
        return response;
      }

      // Add user message to chat
      updateChatMessages(userMessage, '', true);
      setTimeout(startListening, 1000);

      // Get the current chat history
      const currentChat = getCurrentChat();
      const chatHistory = currentChat.messages.slice(-5); // Get last 5 messages

      // Construct the prompt using only the user's message and chat history
      const prompt = constructPrompt(userMessage, chatHistory);

      // Start streaming AI response
      const stream = await generateLlamaResponseStream(prompt);
      let fullResponse = '';
      let currentSentence = '';

      isGeneratingText.current = true;
      for await (const chunk of stream) {
        fullResponse += chunk;
        currentSentence += chunk;
        
        updateChatMessages('', fullResponse, false);

        if (chunk.match(/[.!?]\s*$/)) {
          const emotion = analyzeEmotion(currentSentence);
          const processedSentence = addEmotionalNuance(currentSentence, emotion);
          await speakText(processedSentence, emotion);
          currentSentence = '';
          stopListening();

        }
      }

      // Speak any remaining text
      if (currentSentence) {
        const emotion = analyzeEmotion(currentSentence);
        const processedSentence = addEmotionalNuance(currentSentence, emotion);
        await speakText(processedSentence, emotion);
      }

      isGeneratingText.current = false;

      // Process the full response for display
      const emotion = analyzeEmotion(fullResponse);
      let processedResponse = addEmotionalNuance(fullResponse, emotion);
      processedResponse = addPersonalTouch(processedResponse);
      processedResponse = addSupportiveLanguage(processedResponse);

      // Update the final response
      updateChatMessages('', processedResponse, true);

      return processedResponse;
    } catch (error) {
      console.error("Error in handleAiResponse:", error);
      setTimeout(startListening, 1000);

      return "I'm sorry, I encountered an error. Can we try that again?";
    }
  };

  const updateChatMessages = useCallback((userMessage: string, aiResponse: string, isComplete: boolean = false) => {
    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === currentChatId) {
        const updatedMessages = [...chat.messages];
        
        if (userMessage) {
          // Add user message
          updatedMessages.push({ type: 'user', content: userMessage });
        }
        
        if (aiResponse) {
          if (updatedMessages.length > 0 && updatedMessages[updatedMessages.length - 1].type === 'ai') {
            // Update existing AI message
            updatedMessages[updatedMessages.length - 1].content = formatAiResponseForDisplay(aiResponse);
          } else {
            // Add new AI message
            updatedMessages.push({ type: 'ai', content: formatAiResponseForDisplay(aiResponse) });
          }
        }

        return { ...chat, messages: updatedMessages };
      }
      return chat;
    }));
  }, [currentChatId]);

  const formatAiResponseForDisplay = (text: string): string => {
    // Preserve line breaks
    text = text.replace(/\n/g, '<br>');
    
    // Convert markdown-style formatting to HTML
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");
    text = text.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Convert URLs to clickable links
    text = text.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Preserve emotional cues in square brackets
    text = text.replace(/\[(.*?)\]/g, '<span class="emotional-cue">[$1]</span>');

    return text;
  };

  const processAiChunk = async (chunk: string) => {
      if (!worker) {
    console.error('Worker is not initialized');
    return chunk; // Return the original chunk if worker is not available
  }
    return new Promise<string>((resolve) => {
      worker.onmessage = (event) => {
        resolve(decodeHtmlEntities(event.data));
      };
      worker.postMessage({ type: 'processChunk', chunk });
    });
  };

  const isAppointmentRequest = (message: string) => {
    const keywords = ['book', 'make', 'schedule', 'appointment'];
    return keywords.some(keyword => message.toLowerCase().includes(keyword));
  };

  const isEmailRequest = (message: string) => {
    const keywords = ['email', 'mail', 'inbox'];
    return keywords.some(keyword => message.toLowerCase().includes(keyword));
  };

  const determineEmailQueryType = (message: string): string => {
    if (message.includes('unread') || message.includes('new')) return 'unread';
    if (message.includes('important')) return 'important';
    if (message.includes('sent')) return 'sent';
    if (message.includes('draft')) return 'draft';
    return 'recent';
  };

  const fetchEmailData = async (accessToken: string, query: string) => {
    try {
      const emailResponse = await readEmail(accessToken, query);
      const jsonString = emailResponse.match(/\[.*\]/)?.[0];
      return jsonString ? JSON.parse(jsonString) : [];
    } catch (error) {
      console.error("Failed to parse email response:", error);
      return [];
    }
  };

  const generateDetailedEmailResponse = async (emailData: any[], query: string): Promise<string> => {
    if (emailData && emailData.length > 0) {
      const emailSummaries = await Promise.all(emailData.slice(0, 3).map(async (email: any, index: number) => {
        const sender = email.from.match(/<(.+)>/)?.[1] || email.from;
        const summary = await getEmailSummary(email);
        return `Email ${index + 1} was sent by ${sender}. ${summary}`;
      }));

      const emailSummary = emailSummaries.join('\n\n');
      return `[warmly] Sweetie, I've checked your emails for you. Here's a detailed summary of your ${query} emails:\n\n${emailSummary}\n\nWould you like me to elaborate on any of these emails?`;
    } else {
      return `[gently] I'm sorry, darling. I couldn't find any ${query} emails at the moment. Is there anything else I can help you with?`;
    }
  };

  const getEmailSummary = async (email: any) => {
    const emailContent = `
      Subject: ${email.subject}
      From: ${email.from}
      Preview: ${email.snippet}
    `;
    const summary = await generateLlamaResponse(`Summarize the following email in 2-3 sentences, highlighting the key points. Do not include phrases like "Here is a summary" or "In summary". Just provide the concise summary:\n\n${emailContent}`);
    return summary.trim();
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
    
    setIsGeneratingResponse(false);
    
    setIsWaitingForWakeWord(true);
    setIsCapturingQuery(false);
    setUserQuery("");
  };

  const speakText = async (text: string, emotion: string = 'warm') => {
    stopListening();

    audioQueue.current.push({ text, emotion });
    if (!isProcessingAudio.current) {
      processAudioQueue();
    }
  };

  const processAudioQueue = async () => {
    if (audioQueue.current.length === 0) {
      isProcessingAudio.current = false;
      return;
    }

    isProcessingAudio.current = true;
    const { text: textToSpeak, emotion } = audioQueue.current.shift() || { text: '', emotion: 'warm' };

    try {
      setIsSpeaking(true);
      const processedText = prepareTextForSpeech(textToSpeak);
      console.log("Processed text for speech:", processedText);
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: processedText, emotion, voiceStyle }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate speech: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        if (audioQueue.current.length > 0) {
          processAudioQueue();
        } else {
          isProcessingAudio.current = false;
          setIsSpeaking(false);
          setTimeout(startListening, 1000);

        }
      };

      await audio.play();
    } catch (error) {
      console.error('Error in speakText:', error);
      isProcessingAudio.current = false;
      setIsSpeaking(false);
      if (audioQueue.current.length > 0) {
        processAudioQueue();
      }
    }
  };

  const prepareTextForSpeech = (text: string): string => {
    // Remove HTML tags, emotional cues, and other formatting
    text = text.replace(/<[^>]*>|\[.*?\]|\(.*?\)|\*.*?\*/g, '');
    
    // Remove extra spaces
    text = text.replace(/\s+/g, ' ').trim();
    
    // Add pauses for punctuation without using custom markers
    text = text.replace(/([.!?])\s*/g, '$1 ');
    text = text.replace(/,\s*/g, ', ');
    
    // Remove any remaining special characters
    text = text.replace(/[^\w\s.!?',;:-]/g, '');
    
    return text;
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
    accessToken
  };
};

export default useHealthAssistant;
