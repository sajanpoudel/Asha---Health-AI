import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatMessage from './ChatMessage';
import '../types'

interface ChatAreaProps {
  getCurrentChat: () => Chat;
  isGeneratingResponse: boolean;
}

const ChatArea: React.FC<ChatAreaProps> = ({ getCurrentChat, isGeneratingResponse }) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [getCurrentChat().messages]);

  return (
    <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
      <AnimatePresence>
        {getCurrentChat().messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ChatMessage message={message} />
          </motion.div>
        ))}
      </AnimatePresence>
      {isGeneratingResponse && (
        <motion.div
          className="text-gray-500 italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, repeat: Infinity, repeatType: 'reverse' }}
        >
          AI is thinking...
        </motion.div>
      )}
    </div>
  );
};

export default ChatArea;