import React from 'react';
import { motion } from 'framer-motion';
import { Home, User, FileText, Plus, Settings, ChevronLeft, ChevronRight, Moon, Sun, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  chats: Chat[];
  currentChatId: string;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
  createNewChat: () => void;
  switchChat: (chatId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  toggleSidebar,
  chats,
  currentChatId,
  isDarkMode,
  setIsDarkMode,
  createNewChat,
  switchChat
}) => {
  const sidebarVariants = {
    open: { x: 0, width: 280 },
    closed: { x: -280, width: 0 },
  };

  return (
    <motion.div
      className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-900 shadow-lg z-50 overflow-hidden ${isDarkMode ? 'dark' : ''}`}
      initial="closed"
      animate={isOpen ? 'open' : 'closed'}
      variants={sidebarVariants}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex flex-col h-full p-4 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Asha Health</h2>
          <motion.button
    onClick={createNewChat}
    className="p-2 rounded-full bg-blue-500 text-white shadow-md"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
  >
    <Plus size={20} />
  </motion.button>

          <motion.button
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSidebar}
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </motion.button>
          
        </div>

   

        <nav className="space-y-2 mb-6">
          <SidebarLink href="/health-assistant" icon={<Home size={20} />} text="Home" />
          <SidebarLink href="/profile" icon={<User size={20} />} text="Profile" />
          <SidebarLink href="/questionnaire" icon={<FileText size={20} />} text="Questionnaire" />
        </nav>

        <div className="flex-grow overflow-y-auto">
          <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">Your Chats</h3>
          <div className="space-y-1">
            {chats.map((chat) => (
              <motion.button
                key={chat.id}
                onClick={() => switchChat(chat.id)}
                className={`w-full p-2 text-left rounded-lg transition-colors flex items-center ${
                  chat.id === currentChatId 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
                whileHover={{ x: 5 }}
              >
                <MessageSquare size={16} className="mr-2" />
                <span className="truncate">{chat.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="mt-auto flex justify-between items-center">
          <motion.button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>
          <Link href="/settings" passHref>
            <motion.a
              className="m-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings size={20} />
            </motion.a>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

const SidebarLink: React.FC<{ href: string; icon: React.ReactNode; text: string }> = ({ href, icon, text }) => (
  <Link href={href} passHref>
    <motion.a
      className="flex items-center space-x-3 p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
      whileHover={{ x: 5 }}
    >
      {icon}
      <span className="text-sm font-medium">{text}</span>
    </motion.a>
  </Link>
);

export default Sidebar;