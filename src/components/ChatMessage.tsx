import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface ChatMessageProps {
  message: {
    type: 'user' | 'ai';
    content: string;
  };
  isLoading?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLoading }) => {
  return (
    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <Card className={`max-w-[70%] ${message.type === 'user' ? 'bg-[#000000] text-[#FFFFFF]' : 'bg-[#FFFFFF] dark:bg-[#1A1A1A]'} rounded-2xl shadow-lg`}>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></div>
            </div>
          ) : (
            <p 
              className={`${message.type === 'ai' ? 'text-[#000000] dark:text-[#FFFFFF]' : ''}`}
              dangerouslySetInnerHTML={{ __html: message.content }}
            ></p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatMessage;
