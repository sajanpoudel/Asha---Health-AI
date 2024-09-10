import React from 'react';
import { Plus, MessageSquare, Sun, Moon, Menu, X, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

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
    <AnimatePresence>
      {isSidebarOpen && (
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-80 h-full bg-background dark:bg-card shadow-xl flex flex-col fixed left-0 top-0 z-50"
        >
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-3xl font-extrabold text-foreground font-sans">ashaHealth</h2>
            <Button onClick={toggleSidebar} variant="ghost" size="icon" className="text-muted-foreground hover:bg-secondary/50 dark:hover:bg-secondary/50">
              <X size={24} />
            </Button>
          </div>
          <div className="p-6">
            <Button onClick={createNewChat} className="w-full flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-lg font-semibold">
              <Plus className="mr-2" size={24} /> New Chat
            </Button>
          </div>
          <ScrollArea className="flex-grow px-4">
            {chats.map((chat) => (
              <Button
                key={chat.id}
                onClick={() => switchChat(chat.id)}
                className={`w-full text-left mb-3 py-3 px-4 rounded-lg transition-all duration-200 ${
                  chat.id === currentChatId 
                    ? 'bg-secondary text-secondary-foreground shadow-md' 
                    : 'hover:bg-secondary/50 text-muted-foreground'
                }`}
              >
                <MessageSquare className="mr-3 inline-block" size={20} />
                {chat.messages.length > 0 ? chat.messages[0].content.slice(0, 20) + '...' : 'New Chat'}
              </Button>
            ))}
          </ScrollArea>
          <div className="p-6 border-t border-border dark:border-gray-800 flex justify-between items-center">
            <Button
              onClick={() => setIsDarkMode(!isDarkMode)}
              variant="outline"
              size="icon"
              className="text-muted-foreground border-border hover:bg-secondary/50"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
            <Button variant="outline" size="icon" className="text-muted-foreground border-border hover:bg-secondary/50">
              <Settings size={20} />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
