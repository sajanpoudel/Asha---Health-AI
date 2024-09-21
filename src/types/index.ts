export interface Chat {
  id: string;
  name: string;
  messages: Message[];
}

export interface Message {
  type: 'user' | 'ai';
  content: string;
}