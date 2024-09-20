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

const HealthAssistantPage: React.FC<HealthAssistantPageProps> = ({ personalData, accessToken }) => {
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
  } = useHealthAssistant(accessToken);

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark' : ''} bg-background dark:bg-background font-sans relative overflow-hidden`}>
      {/* Enhanced Glowing effect */}
      {isListening && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-primary opacity-5 animate-pulse"></div>
          <div className="absolute inset-0 bg-primary opacity-5 animate-pulse delay-300"></div>
          <div className="absolute inset-0 bg-primary opacity-5 animate-pulse delay-600"></div>
          <div className="absolute inset-0 bg-gradient-radial from-primary/20 to-transparent animate-ping"></div>
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
            className="fixed top-6 left-6 z-50 rounded-full p-3 bg-background dark:bg-card shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Menu className="w-6 h-6 text-foreground" />
          </Button>
        </motion.div>
      )}

      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isSidebarOpen={isSidebarOpen}
        createNewChat={createNewChat}
        switchChat={switchChat}
        toggleSidebar={toggleSidebar}
      />

      <motion.div 
        className={`flex-1 flex flex-col ${isSidebarOpen ? 'ml-80' : 'ml-0'} transition-all duration-300 relative z-10`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <nav className="p-4 bg-primary text-primary-foreground">
      <Link href="/profile" passHref>
        <Button variant="outline" className="mr-2">Profile</Button>
      </Link>
      <Link href="/questionnaire" passHref>
        <Button variant="outline">Health Questionnaire</Button>
      </Link>
    </nav>
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
          isProcessing={isListening || isGeneratingResponse} // Add this line
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