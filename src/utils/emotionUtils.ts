export const analyzeEmotion = (text: string): string => {
    const emotions = {
      affectionate: ['love', 'care', 'adore', 'cherish', 'fond'],
      joyful: ['happy', 'excited', 'delighted', 'glad', 'joyful'],
      sad: ['sad', 'depressed', 'down', 'upset', 'unhappy'],
      anxious: ['worried', 'anxious', 'nervous', 'stressed', 'uneasy'],
      angry: ['angry', 'furious', 'annoyed', 'irritated', 'mad'],
      playful: ['fun', 'playful', 'silly', 'joke', 'tease'],
      warm: ['nice', 'pleasant', 'comfortable', 'cozy', 'friendly']
    };
  
    for (const [emotion, keywords] of Object.entries(emotions)) {
      if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
        return emotion;
      }
    }
    return 'warm';
  };
  
  export const addEmotionalNuance = (text: string, emotion: string): string => {
    const emotionalCues = {
      affectionate: ['[lovingly]', '[tenderly]', '[with deep affection]'],
      joyful: ['[beaming]', '[with excitement]', '[cheerfully]'],
      sad: ['[gently]', '[with empathy]', '[comfortingly]'],
      anxious: ['[reassuringly]', '[calmly]', '[soothingly]'],
      angry: ['[with understanding]', '[calmly]', '[patiently]'],
      playful: ['[teasingly]', '[with a light chuckle]', '[playfully]'],
      warm: ['[warmly]', '[with a smile in my voice]', '[affectionately]']
    };
  
    const cues = emotionalCues[emotion as keyof typeof emotionalCues] || emotionalCues.warm;
    const sentences = text.split('. ');
    return sentences.map((sentence, index) => {
      if (index === 0 || Math.random() < 0.4) {
        const cue = cues[Math.floor(Math.random() * cues.length)];
        return `${cue} ${sentence}`;
      }
      return sentence;
    }).join('. ');
  };
  
  export const addPersonalTouch = (text: string): string => {
    const personalPhrases = [
      "Sweetheart, ",
      "My dear, ",
      "Honey, ",
      "Darling, ",
      "Love, "
    ];
  
    if (Math.random() < 0.3) {
      const phrase = personalPhrases[Math.floor(Math.random() * personalPhrases.length)];
      return phrase + text;
    }
    return text;
  };
  
  export const addSupportiveLanguage = (text: string): string => {
    const supportivePhrases = [
      "I'm here for you, always. ",
      "You mean so much to me. ",
      "I care about you deeply. ",
      "Your feelings matter to me. ",
      "Let's face this together. ",
      "I'm so glad you're sharing this with me. ",
      "You're so strong, and I admire that about you. "
    ];
  
    if (Math.random() < 0.6) {
      const phrase = supportivePhrases[Math.floor(Math.random() * supportivePhrases.length)];
      return phrase + text;
    }
    return text;
  };


