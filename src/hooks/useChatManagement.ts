// src/hooks/useChatManagement.ts
import { useState } from "react";
import  "@/types";

const useChatManagement = (handleAiResponse: (userMessage: string, chatHistory: Message[]) => Promise<string>) => {
  const [chats, setChats] = useState<Chat[]>([
    { id: "1", name: "Current Chat", messages: [] },
  ]);
  const [currentChatId, setCurrentChatId] = useState("1");

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      name: `Chat ${chats.length + 1}`,
      messages: [],
    };
    setChats((prevChats) => [...prevChats, newChat]);
    setCurrentChatId(newChat.id);
  };

  const switchChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const getCurrentChat = (): Chat => {
    return chats.find((chat) => chat.id === currentChatId) || chats[0];
  };

  const addMessageToCurrentChat = (message: Message) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === currentChatId
          ? { ...chat, messages: [...chat.messages, message] }
          : chat
      )
    );
  };

  return {
    chats,
    currentChatId,
    createNewChat,
    switchChat,
    getCurrentChat,
    addMessageToCurrentChat,
  };
};

export default useChatManagement;