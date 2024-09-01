import React, { useRef, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import useHealthAssistant from '@/hooks/useHealthAssistant';
import ChatMessage from './ChatMessage';
import '@/types';

interface ChatAreaProps {
  getCurrentChat: () => Chat;
  isGeneratingResponse: boolean;
}

const ChatArea: React.FC<ChatAreaProps> = ({ getCurrentChat, isGeneratingResponse }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [getCurrentChat().messages]);

  const currentChat: Chat = getCurrentChat();

  return (
    <ScrollArea className="flex-grow p-6 pb-24">
      {currentChat.messages.map((message: Message, index: number) => (
        <ChatMessage key={index} message={message} />
      ))}
      {isGeneratingResponse && (
        <ChatMessage message={{ type: 'ai', content: 'Generating response...' }} isLoading />
      )}
      <div ref={messagesEndRef} />
    </ScrollArea>
  );
};

export default ChatArea;
