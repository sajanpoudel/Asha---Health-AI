'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import useHealthAssistant from '@/hooks/useHealthAssistant';
import Sidebar from '@/components/Sidebar';
import UserProfilePage from '@/components/pages/UserProfilePage';
import { motion } from "framer-motion";

const ProfilePage = () => {
  const {
    isDarkMode,
    isSidebarOpen,
    toggleSidebar,
    setIsDarkMode,
    createNewChat,
    toggleVoiceListening
  } = useHealthAssistant();

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-sans relative overflow-hidden">
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
        setActiveTab={() => {}}
        activeTab="profile"
      />

      <motion.div 
        className={`flex-1 flex flex-col ${isSidebarOpen ? 'ml-64' : 'ml-0'} transition-all duration-300 relative z-10`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <UserProfilePage toggleVoiceListening={toggleVoiceListening} />
      </motion.div>
    </div>
  );
};

export default ProfilePage;