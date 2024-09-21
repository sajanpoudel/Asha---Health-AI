'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import useHealthAssistant from '@/hooks/useHealthAssistant';
import Sidebar from '@/components/Sidebar';
import ChatArea from '../ChatArea';
import MessageInput from '../MessageInput';
import '@/types';
import { motion } from "framer-motion";
import Link from 'next/link';

interface HealthAssistantPageProps {
  personalData: {
    name: string;
    email: string;
    picture: string;
  };
  accessToken: string;
}

const HealthAssistantPage: React.FC<HealthAssistantPageProps> = ({ personalData }) => {
  const {
    isDarkMode,
    isSidebarOpen,
    toggleSidebar,
    chats,
    currentChatId,
    setIsDarkMode,
    createNewChat,
    switchChat,
    getCurrentChat,
    isGeneratingResponse,
    inputMessage,
    setInputMessage,
    isListening,
    isSpeaking,
    isWaitingForWakeWord,
    transcript,
    voiceIconAnimation,
    handleSendMessage,
    startListening,
    speakText,
    recognitionError,
    accessToken
  } = useHealthAssistant();

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark' : ''} bg-white dark:bg-gray-900 font-sans relative overflow-hidden`}>
      {/* Glowing effect */}
      {isListening && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-blue-500 opacity-5 animate-pulse"></div>
        </div>
      )}

      {!isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            onClick={toggleSidebar}
            className="fixed top-6 left-6 z-50 rounded-full p-3 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Menu className="w-6 h-6 text-gray-800 dark:text-white" />
          </Button>
        </motion.div>
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        chats={chats}
        currentChatId={currentChatId}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        createNewChat={createNewChat}
        switchChat={switchChat}
      />

      <motion.div 
        className={`flex-1 flex flex-col ${isSidebarOpen ? 'ml-80' : 'ml-0'} transition-all duration-300 relative z-10`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
     
        <ChatArea
          getCurrentChat={getCurrentChat}
          isGeneratingResponse={isGeneratingResponse}
        />
        <MessageInput
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          isListening={isListening}
          isSpeaking={isSpeaking}
          isWaitingForWakeWord={isWaitingForWakeWord}
          transcript={transcript}
          isDarkMode={isDarkMode}
          voiceIconAnimation={voiceIconAnimation}
          handleSendMessage={handleSendMessage}
          startListening={startListening}
          speakText={speakText}
          getCurrentChat={getCurrentChat}
          isProcessing={isListening || isGeneratingResponse}
        />
      </motion.div>

      {recognitionError && (
        <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-md">
          {recognitionError}
        </div>
      )}
    </div>
  );
};

export default HealthAssistantPage;