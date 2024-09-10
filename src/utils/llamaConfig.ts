import { Ollama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { prompt } from "@/constants/textConstants";

export const LLAMA_MODEL = "llama3.1";

const ollama = new Ollama({
  baseUrl: "http://localhost:11434",
  model: LLAMA_MODEL,
});

const promptTemplate = PromptTemplate.fromTemplate(
  "You are a helpful AI assistant. {prompt}"
);

export const generateLlamaResponse = async (prompt: string): Promise<string> => {
  const chain = RunnableSequence.from([
    promptTemplate,
    ollama,
    new StringOutputParser(),
  ]);

  const response = await chain.invoke({ prompt });
  return response.trim();
};

export const generateLlamaResponseStream = async function* (prompt: string) {
  const chain = RunnableSequence.from([
    promptTemplate,
    ollama,
    new StringOutputParser(),
  ]);

  const stream = await chain.stream({ prompt });

  for await (const chunk of stream) {
    yield chunk;
  }
};