import { useState } from 'react';
import '@/types';

const useChatManagement = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { 
      role: 'system', 
      content: "You are a financial  assistant. Provide brief, focused answers on finance topics only. Limit responses to 2-3 sentences. If asked about non-finance topics, politely redirect to finance-related discussions."
    }
  ]);
  const [chats, setChats] = useState<Chat[]>([{ id: '1', name: 'Current Chat', messages: [] }]);
  const [currentChatId, setCurrentChatId] = useState('1');

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      name: `Chat ${chats.length + 1}`,
      messages: []
    };
    setChats([...chats, newChat]);
    setCurrentChatId(newChat.id);
    setMessages([]);
  };

  const switchChat = (chatId: string) => {
    setCurrentChatId(chatId);
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setMessages(chat.messages);
    }
  };

  return {
    messages,
    setMessages,
    chatHistory,
    setChatHistory,
    chats,
    currentChatId,
    createNewChat,
    switchChat
  };
};

export default useChatManagement;