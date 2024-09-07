import { addEmotionalNuance, addPersonalTouch, addSupportiveLanguage } from '../utils/emotionUtils';
import { formatAiResponse } from '../utils/textUtils';

self.onmessage = (event) => {
  if (event.data.type === 'processChunk') {
    const { chunk } = event.data;
    const processedChunk = processAiChunk(chunk);
    self.postMessage(processedChunk);
  }
};

function processAiChunk(chunk: string): string {
  let processedChunk = chunk.replace(/\[.*?\]/g, '')
    .replace(/•/g, 'Bullet point:')
    .replace(/\n/g, ' ');

  const detectedEmotion = 'warm'; // For simplicity, we're using a default emotion
  processedChunk = addEmotionalNuance(processedChunk, detectedEmotion);
  processedChunk = addPersonalTouch(processedChunk);
  processedChunk = addSupportiveLanguage(processedChunk);

  return formatAiResponse(processedChunk);
}