

export const cleanTextForDisplay = (text: string): string => {
    text = text.replace(/\[.*?\]|\[amazon:.*?\]|\[With.*?\]/g, '');
    text = decodeHtmlEntities(text);
    text = text.replace(/<[^>]*>/g, '');
    text = text.replace(/\s+/g, ' ').trim();
    text = text.replace(/^[.,!?]+|[.,!?]+$/g, '');
    return text;
  };
  
  export const decodeHtmlEntities = (text: string): string => {
    const entities: { [key: string]: string } = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#039;': "'",
      '&apos;': "'",
      '&#x27;': "'",
      '&#x2F;': '/',
      '&#32;': ' ',
      '&nbsp;': ' '
    };
    return text.replace(/&[\w\d#]{2,5};/g, entity => entities[entity] || entity);
  };
  
  export const prepareTextForSpeech = (text: string): string => {
    text = cleanTextForDisplay(text);
    text = text.replace(/<br\s*\/?>/gi, '. ');
    text = text.replace(/\n+/g, '. ');
    text = text.replace(/([.!?])\s*/g, '$1 ');
    text = text.replace(/,\s*/g, ', ');
    text = addContextBasedPauses(text);
    text = addEmphasis(text);
    text = softenEndearments(text);
    text = text.replace(/[^\w\s.,!?'-]/g, '');
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  };
  
  const addContextBasedPauses = (text: string): string => {
    const longerPausePhrases = ['Oh my goodness', 'I care about you deeply', 'Sweetie', 'Darling', 'Sweetheart'];
    longerPausePhrases.forEach(phrase => {
      const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
      text = text.replace(regex, `${phrase}...`);
    });
    const sentences = text.split(/(?<=[.!?])\s+/);
    return sentences.map((sentence, index) => {
      if (index < sentences.length - 1 && Math.random() < 0.3) {
        return sentence + '...';
      }
      return sentence;
    }).join(' ');
  };
  
  const addEmphasis = (text: string): string => {
    const emphasizeWords = ['moon', 'sun', 'cosmic', 'adventure', 'stars', 'lunar', 'space', 'universe'];
    const regex = new RegExp(`\\b(${emphasizeWords.join('|')})\\b`, 'gi');
    return text.replace(regex, (match) => match.toUpperCase());
  };
  
  const softenEndearments = (text: string): string => {
    const endearments = ['Sweetie', 'Darling', 'Sweetheart'];
    endearments.forEach(endearment => {
      const regex = new RegExp(`\\b${endearment}\\b`, 'gi');
      text = text.replace(regex, `${endearment.toLowerCase()}...`);
    });
    text = text.replace(/\b(\w+)\b\s+\1\b/gi, '$1');
    return text;
  };
