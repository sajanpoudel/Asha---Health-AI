import React from 'react';
import { Mic, Volume2, Send, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MessageInputProps {
  inputMessage: string;
  setInputMessage: React.Dispatch<React.SetStateAction<string>>;
  isListening: boolean;
  isSpeaking: boolean;
  isWaitingForWakeWord: boolean;
  transcript: string;
  isDarkMode: boolean;
  voiceIconAnimation: any;
  handleSendMessage: () => void;
  startListening: () => void;
  speakText: (text: string) => void;
  getCurrentChat: () => Chat;
  isProcessing: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  inputMessage,
  setInputMessage,
  isListening,
  isSpeaking,
  isWaitingForWakeWord,
  transcript,
  isDarkMode,
  voiceIconAnimation,
  handleSendMessage,
  startListening,
  speakText,
  getCurrentChat,
  isProcessing,
}) => {
  const showListeningAnimation = isListening || (isProcessing && transcript !== '' && !isSpeaking);

  return (
    <div className="p-6 bg-background dark:bg-background relative">
      <div className="flex items-center bg-card dark:bg-card rounded-full shadow-lg p-2 relative overflow-hidden">
        {showListeningAnimation && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full bg-gradient-to-r from-blue-400/20 to-indigo-500/20 animate-pulse"></div>
          </div>
        )}
        {isSpeaking && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full bg-gradient-to-r from-green-400/20 to-teal-500/20 animate-pulse-slow"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-green-500/10 rounded-full animate-ping"></div>
            </div>
          </div>
        )}
        <Button
          onClick={startListening}
          className={`mr-2 rounded-full p-3 ${
            isListening ? 'bg-blue-500 hover:bg-blue-600' : 'bg-primary hover:bg-primary/90'
          } transition-all duration-200 shadow-md hover:shadow-lg z-10`}
        >
          <Mic className={`w-6 h-6 ${isListening ? 'text-white' : 'text-primary-foreground'} ${isListening ? 'animate-pulse' : ''}`} />
        </Button>
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={
            isWaitingForWakeWord ? 'Say "Hey Asha" to start' :
            isListening ? 'Listening...' :
            isSpeaking ? 'Speaking...' :
            transcript ? transcript :
            'Type your message...'
          }
          className="flex-grow bg-transparent border-none focus:ring-0 text-lg text-foreground font-sans z-10"
        />
        <Button
          onClick={() => speakText(getCurrentChat().messages[getCurrentChat().messages.length - 1].content)}
          className={`mr-2 rounded-full p-3 transition-all duration-200 shadow-md hover:shadow-lg z-10 overflow-hidden ${
            isSpeaking ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-primary/90'
          }`}
          disabled={getCurrentChat().messages.length === 0}
        >
          {isSpeaking ? (
            <div className="relative w-6 h-6">
              <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-75"></div>
              <Loader2 className="absolute inset-0 w-6 h-6 text-white animate-spin" />
            </div>
          ) : (
            <Volume2 className="w-6 h-6 text-primary-foreground" />
          )}
        </Button>
        <Button
          onClick={handleSendMessage}
          className="rounded-full p-3 bg-primary hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg z-10"
          disabled={inputMessage.trim() === '' && !isListening}
        >
          <Send className="w-6 h-6 text-primary-foreground" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
