export const formatAiResponse = (text: string): string => {
  // Remove emotional cues in <em> tags
  text = text.replace(/<em>.*?<\/em>/g, '');

  // Convert markdown-style formatting to HTML
  let processedText = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  processedText = processedText.replace(/\*(.*?)\*/g, "<em>$1</em>");
  processedText = processedText.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Convert URLs to clickable links
  processedText = processedText.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Replace <br> tags with actual line breaks for HTML rendering
  processedText = processedText.replace(/<br\s*\/?>/gi, '<br>');

  // Replace single newlines with <br> tags
  processedText = processedText.replace(/\n/g, '<br>');

  // Instead of using DOMPurify, we'll use a simple function to escape HTML
  return escapeHtml(processedText);
};

// Add this function to escape HTML
export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const stripHtmlAndFormatting = (text: string): string => {
  let strippedText = text.replace(/<[^>]*>/g, '');
  strippedText = strippedText.replace(/&#?\w+;/g, match => decodeHtmlEntities(match));
  strippedText = strippedText.replace(/\s+/g, ' ');
  return strippedText.trim();
};

export const simplifyText = (text: string): string => {
  // Remove HTML tags and decode entities
  text = text.replace(/<[^>]*>/g, '').trim();
  text = decodeHtmlEntities(text);

  // Handle lists
  text = text.replace(/(\d+\.|\*)\s*(.*?)(?=(\n|$))/g, (match, bullet, item) => {
    return `${item.trim()} <break time="500ms"/>`;
  });

  const simplifications = {
    "utilize": "use",
    "implement": "use",
    "facilitate": "help",
    "regarding": "about",
    "commence": "start",
    "terminate": "end",
    "subsequently": "then",
    "nevertheless": "however",
    "approximately": "about",
    "sufficient": "enough"
  };

  Object.entries(simplifications).forEach(([complex, simple]) => {
    const regex = new RegExp(`\\b${complex}\\b`, 'gi');
    text = text.replace(regex, simple);
  });

  return addNaturalPauses(text);
};

export const addNaturalPauses = (text: string): string => {
  const sentences = text.split(/(?<=[.!?])(\s|$)/);
  return sentences.map(sentence => {
    // Split the sentence into clauses
    const clauses = sentence.split(/([,;:])/);
    let processedSentence = '';
    
    for (let i = 0; i < clauses.length; i++) {
      const clause = clauses[i].trim();
      if (clause === ',' || clause === ';' || clause === ':') {
        processedSentence += `${clause} <break time="200ms"/>`;
      } else if (clause.length > 0) {
        processedSentence += clause;
        if (i < clauses.length - 1 && clause.split(' ').length > 5) {
          processedSentence += ' <break time="100ms"/>';
        }
      }
    }
    
    // Add pause at the end of the sentence
    return processedSentence + ' <break time="400ms"/>';
  }).join(' ');
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