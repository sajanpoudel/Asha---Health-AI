import React from 'react';
import { Plus, MessageSquare, Sun, Moon, Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  createNewChat: () => void;
  chats: Chat[];
  currentChatId: string;
  switchChat: (id: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  toggleSidebar,
  createNewChat,
  chats,
  currentChatId,
  switchChat,
  isDarkMode,
  setIsDarkMode
}) => {
  return (
    <div className={`${isSidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 ease-in-out overflow-hidden bg-[#FFFFFF] dark:bg-[#1A1A1A] shadow-lg flex flex-col`}>
      {/* Sidebar content */}
      {/* ... (copy the sidebar content from your original code) ... */}
      <div className="p-4 border-b border-[#E0E0E0] dark:border-[#333333] flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#000000] dark:text-[#FFFFFF]">ashaHealth</h2>
          <Button onClick={toggleSidebar} variant="ghost" size="icon" className="text-[#000000] dark:text-[#FFFFFF]">
            <Menu size={24} />
          </Button>
        </div>
        <div className="p-4">
          <Button onClick={createNewChat} className="w-full flex items-center justify-center bg-[#000000] hover:bg-[#333333] dark:bg-[#FFFFFF] dark:hover:bg-[#E0E0E0] text-[#FFFFFF] dark:text-[#000000] py-3 rounded-lg">
            <Plus className="mr-2" size={20} /> New Chat
          </Button>
        </div>
        <ScrollArea className="flex-grow p-6">
          {chats.map((chat) => (
            <Button
              key={chat.id}
              onClick={() => switchChat(chat.id)}
              className={`w-full text-left mb-2 ${
                chat.id === currentChatId ? 'bg-[#E0E0E0] dark:bg-[#333333]' : ''
              }`}
            >
              <MessageSquare className="mr-2" size={16} />
              {chat.name}
            </Button>
          ))}
        </ScrollArea>

        <div className="p-4 border-t border-[#E0E0E0] dark:border-[#333333] mt-auto">
          <Button
            onClick={() => setIsDarkMode(!isDarkMode)}
            variant="outline"
            className="w-full py-2 text-[#000000] dark:text-[#FFFFFF] border-[#000000] dark:border-[#FFFFFF]"
          >
            {isDarkMode ? <Sun className="mr-2" size={20} /> : <Moon className="mr-2" size={20} />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </div>
      </div>
  );
};

export default Sidebar;
