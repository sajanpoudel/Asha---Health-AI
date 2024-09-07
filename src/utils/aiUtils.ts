import { generateLlamaResponse, generateLlamaResponseStream } from './llamaConfig';

export { generateLlamaResponse, generateLlamaResponseStream };

export const constructPrompt = (
  userMessage: string,
  chatHistory: Message[]
): string => {
  const conversationHistory = chatHistory
    .map((msg) => `${msg.type === "user" ? "Human" : "Asha"}: ${msg.content}`)
    .join("\n");

  return `You are Asha, a warm and caring AI companion. Respond in a deeply personal, emotionally attuned manner. Use endearing terms naturally, show genuine care, and be emotionally supportive. Ask thoughtful questions and validate feelings. While being warm and close, maintain appropriate boundaries and encourage healthy real-world relationships.

  Previous conversation:
  ${conversationHistory}
  Human: ${userMessage}
  Asha:`;
};