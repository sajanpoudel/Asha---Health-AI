import React from 'react';
import { MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatHistorySectionProps {
  chats: Chat[];
  switchChat: (chatId: string) => void;
  setActiveTab: (tab: string) => void;
}

const ChatHistorySection: React.FC<ChatHistorySectionProps> = ({ chats, switchChat, setActiveTab }) => {
  const handleChatClick = (chatId: string) => {
    switchChat(chatId);
    setActiveTab('chat');
  };

  const stripHtmlTags = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const nonEmptyChats = chats.filter(chat => chat.messages.length > 0);

  return (
    <div className="flex-1 overflow-auto p-4 max-w-full">
      <h2 className="text-2xl font-bold mb-4">Chat History</h2>
      {nonEmptyChats.length > 0 ? (
        <div className="space-y-2">
          {nonEmptyChats.map((chat) => (
            <motion.button
              key={chat.id}
              onClick={() => handleChatClick(chat.id)}
              className="w-full p-3 text-left rounded-lg transition-colors flex items-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              whileHover={{ x: 5 }}
            >
              <MessageSquare size={20} className="flex-shrink-0 mr-3 text-gray-500 dark:text-gray-400" />
              <div className="flex-grow min-w-0">
                <span className="font-medium block truncate">{chat.name}</span>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {truncateText(stripHtmlTags(chat.messages[chat.messages.length - 1]?.content || ''), 60)}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No chat history available.</p>
      )}
    </div>
  );
};

export default ChatHistorySection;