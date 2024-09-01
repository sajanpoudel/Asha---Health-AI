import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import useHealthAssistant from '@/hooks/useHealthAssistant';
import Sidebar from '@/components/Sidebar'; // Adjust the path as necessary
import ChatArea from '../ChatArea';
import MessageInput from '../MessageInput';
import '@/types';

const HealthAssistantPage: React.FC = () => {
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
  } = useHealthAssistant();

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark' : ''} bg-[#F5F5F5] dark:bg-[#000000]`}>
      {!isSidebarOpen && (
        <Button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 rounded-full p-3 bg-[#000000] dark:bg-[#FFFFFF] shadow-lg"
        >
          <Menu className="w-6 h-6 text-[#FFFFFF] dark:text-[#000000]" />
        </Button>
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

      <div className={`flex-1 flex flex-col ${isSidebarOpen ? 'ml-0' : 'ml-0'}`}>
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

        />
      </div>
    </div>
  );
};

export default HealthAssistantPage;