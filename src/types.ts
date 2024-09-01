interface Message {
    type: 'user' | 'ai';
    content: string;
  }
  
  interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }
  interface Chat {
    id: string;
    name: string;
    messages: Message[];
  }
  