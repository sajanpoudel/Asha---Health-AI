'use client';

import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import useHealthAssistant from '@/hooks/useHealthAssistant';
import Sidebar from '@/components/Sidebar';
import ChatArea from '../ChatArea';
import MessageInput from '../MessageInput';
import ChatHistorySection from '../ChatHistorySection';
import '@/types';
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';

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

  const [activeTab, setActiveTab] = useState('chat');
  const router = useRouter();

  const handleTabChange = (tab: string) => {
    if (tab === 'profile') {
      router.push('/profile');
    } else if (tab === 'questionnaire') {
      router.push('/questionnaire');
    } else {
      setActiveTab(tab);
    }
  };

  // Apply dark mode to the root element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const renderMainContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <>
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
          </>
        );
      case 'history':
        return <ChatHistorySection chats={chats} switchChat={switchChat} setActiveTab={setActiveTab} />;
      case 'records':
        return <div>Medical Records Section</div>;
      default:
        return <div>Unknown Section</div>;
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-sans relative overflow-hidden">
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
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        createNewChat={createNewChat}
        setActiveTab={handleTabChange}
        activeTab={activeTab}
      />

      <motion.div 
        className={`flex-1 flex flex-col ${isSidebarOpen ? 'ml-64' : 'ml-0'} transition-all duration-300 relative z-10`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {renderMainContent()}
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