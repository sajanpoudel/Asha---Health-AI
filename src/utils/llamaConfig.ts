export const LLAMA_MODEL = "llama3.1";
export const LLAMA_API_URL = "http://localhost:11434/api/generate";

export const generateLlamaResponse = async (prompt: string): Promise<string> => {
  const response = await fetch(LLAMA_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: LLAMA_MODEL,
      prompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.response.trim();
};

export const generateLlamaResponseStream = async function* (prompt: string) {
  const response = await fetch(LLAMA_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: LLAMA_MODEL,
      prompt,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (line.trim() !== '') {
        const parsedLine = JSON.parse(line);
        yield parsedLine.response;
      }
    }
  }
};