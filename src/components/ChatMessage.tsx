import React from 'react';
import { motion } from 'framer-motion';

interface ChatMessageProps {
  message: {
    type: 'user' | 'ai';
    content: string;
  };
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAi = message.type === 'ai';

  return (
    <motion.div
      className={`flex ${isAi ? 'justify-start' : 'justify-end'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={`max-w-3/4 p-3 rounded-lg ${
          isAi
            ? 'bg-blue-100 text-blue-900'
            : 'bg-green-100 text-green-900'
        }`}
      >
        <p className="text-sm" dangerouslySetInnerHTML={{ __html: message.content }}></p>
      </div>
    </motion.div>
  );
};

export default ChatMessage;