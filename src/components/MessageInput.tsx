import React from 'react';
import { Mic, Volume2, Send } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useHealthAssistant from '@/hooks/useHealthAssistant';

interface MessageInputProps {
  inputMessage: string;
  setInputMessage: React.Dispatch<React.SetStateAction<string>>;
  isListening: boolean;
  isSpeaking: boolean;
  isWaitingForWakeWord: boolean;
  transcript: string;
  isDarkMode: boolean;
  voiceIconAnimation: any; // Specify the correct type
  handleSendMessage: () => void;
  startListening: () => void;
  speakText: (text: string) => void;
  getCurrentChat: () => Chat;
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
}) => {
  return (
    <div className="p-6 bg-transparent">
      <div className="flex items-center bg-[#FFFFFF] dark:bg-[#1A1A1A] rounded-full shadow-lg p-2">
        <Button
          onClick={startListening}
          className={`mr-2 rounded-full p-2 ${
            isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-[#000000] dark:bg-[#FFFFFF]'
          }`}
        >
          <Mic className={`w-6 h-6 ${isListening ? 'text-white' : 'text-[#FFFFFF] dark:text-[#000000]'} ${voiceIconAnimation}`} />
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
              className="flex-grow bg-transparent border-none focus:ring-0 text-lg text-[#000000] dark:text-[#FFFFFF]"
            />
        <Button
          onClick={() => speakText(getCurrentChat().messages[getCurrentChat().messages.length - 1].content)}
          className={`mr-2 rounded-full p-2 ${
            isSpeaking ? 'bg-blue-500 hover:bg-blue-600' : 'bg-[#000000] dark:bg-[#FFFFFF]'
          }`}
          style={{
            transform: isSpeaking ? 'scale(1.1)' : 'scale(1)',
          }}
          disabled={getCurrentChat().messages.length === 0}
        >
          <Volume2 className={`w-6 h-6 ${isSpeaking ? 'text-white' : 'text-[#FFFFFF] dark:text-[#000000]'}`} />
        </Button>
        <Button
          onClick={handleSendMessage}
          className="rounded-full p-2 bg-[#000000] dark:bg-[#FFFFFF]"
          disabled={inputMessage.trim() === '' && !isListening}
        >
          <Send className="w-6 h-6 text-[#FFFFFF] dark:text-[#000000]" />
        </Button>
      </div>
      
    </div>
  );
};

export default MessageInput;
