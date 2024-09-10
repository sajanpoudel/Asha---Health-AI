import React, { useRef, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessage from './ChatMessage';
import '@/types';
import { motion } from "framer-motion";

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
    <ScrollArea className="flex-grow p-8 pb-24 bg-background dark:bg-background">
      {currentChat.messages.map((message: Message, index: number) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChatMessage message={message} />
        </motion.div>
      ))}
      {isGeneratingResponse && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChatMessage message={{ type: 'ai', content: 'Generating response...' }} isLoading />
        </motion.div>
      )}
      <div ref={messagesEndRef} />
    </ScrollArea>
  );
};

export default ChatArea;
