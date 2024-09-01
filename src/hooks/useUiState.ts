import { useState, useEffect } from 'react';

const useUiState = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [voiceIconColor, setVoiceIconColor] = useState('#000000');
  const [voiceIconAnimation, setVoiceIconAnimation] = useState({ color: '#AECED2', scale: 1 });

  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return {
    isDarkMode,
    setIsDarkMode,
    isSidebarOpen,
    voiceIconColor,
    voiceIconAnimation,
    toggleSidebar,
    toggleDarkMode
  };
};

export default useUiState;