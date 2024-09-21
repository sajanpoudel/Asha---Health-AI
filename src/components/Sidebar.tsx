import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, User, ClipboardList, Clock, FileText, Plus, Settings, ChevronLeft, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
  createNewChat: () => void;
  setActiveTab: (tab: string) => void;
  activeTab: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  toggleSidebar,
  isDarkMode,
  setIsDarkMode,
  createNewChat,
  setActiveTab,
  activeTab
}) => {
  const router = useRouter();
  const sidebarVariants = {
    open: { x: 0, width: 256 },
    closed: { x: -256, width: 0 },
  };

  return (
    <motion.div
      className={`fixed top-0 left-0 h-full bg-gray-900 text-white shadow-lg z-50 overflow-hidden ${isDarkMode ? 'dark' : ''}`}
      initial="closed"
      animate={isOpen ? 'open' : 'closed'}
      variants={sidebarVariants}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex flex-col h-full p-4 relative">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-orange-500 rounded-lg mr-2"></div>
            <h1 className="text-xl font-bold">HealthAI</h1>
          </div>
          <Button
            onClick={toggleSidebar}
            variant="ghost"
            size="icon"
            className="text-white"
          >
            <ChevronLeft size={24} />
          </Button>
        </div>

        <nav className="space-y-2 mb-6">
          <div className="flex items-center justify-between">
            <SidebarItem 
              icon={<MessageSquare size={20} />} 
              text="AI Chat" 
              onClick={() => setActiveTab('chat')} 
              active={activeTab === 'chat'}
              className="flex-grow mr-2"
            />
            <Button
              onClick={createNewChat}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-gray-800"
            >
              <Plus size={20} />
            </Button>
          </div>
          <SidebarItem 
            icon={<User size={20} />} 
            text="Profile" 
            onClick={() => router.push('/profile')}
            active={activeTab === 'profile'}
          />
          <SidebarItem 
            icon={<ClipboardList size={20} />} 
            text="Health Questionnaire" 
            onClick={() => router.push('/questionnaire')}
            active={activeTab === 'questionnaire'}
          />
          <SidebarItem 
            icon={<Clock size={20} />} 
            text="Chat History" 
            onClick={() => setActiveTab('history')}
            active={activeTab === 'history'}
          />
          <SidebarItem 
            icon={<FileText size={20} />} 
            text="Medical Records" 
            onClick={() => setActiveTab('records')}
            active={activeTab === 'records'}
          />
        </nav>

        <div className="mt-auto">
          <div className="bg-orange-500 bg-opacity-20 rounded-lg p-4 mb-4">
            <h3 className="text-orange-500 font-semibold mb-2">Pro Plan</h3>
            <p className="text-sm mb-2">Unlock advanced health insights!</p>
            <Button className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">Upgrade</Button>
          </div>
          <div className="flex items-center justify-between">
            <SidebarItem icon={<Settings size={20} />} text="Settings" onClick={() => {}} />
            <Button
              onClick={() => setIsDarkMode(!isDarkMode)}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-gray-800"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const SidebarItem: React.FC<{ 
  icon: React.ReactNode; 
  text: string; 
  onClick: () => void; 
  active?: boolean;
  className?: string; 
}> = ({ icon, text, onClick, active, className }) => (
  <motion.button
    onClick={onClick}
    className={`flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 ${
      active ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-800'
    } ${className || ''}`}
    whileHover={{ x: 5 }}
  >
    {icon}
    <span className="text-sm font-medium">{text}</span>
  </motion.button>
);

export default Sidebar;