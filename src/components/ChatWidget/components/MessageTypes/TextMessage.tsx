
import React from 'react';

interface TextMessageProps {
  text: string;
  highlightText?: string;
}

const TextMessage: React.FC<TextMessageProps> = ({ text, highlightText }) => {
  // If no highlight needed, just return the text
  if (!highlightText || !highlightText.trim()) {
    return <div className="whitespace-pre-wrap">{text}</div>;
  }
  
  // Function to find text to highlight
  const getHighlightedText = () => {
    if (!highlightText || !text) return text;
    
    try {
      const regex = new RegExp(`(${highlightText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const parts = text.split(regex);
      
      return parts.map((part, i) => {
        // Check if this part matches the highlight text (case insensitive)
        const isMatch = part.toLowerCase() === highlightText.toLowerCase();
        
        return isMatch ? 
          <mark key={i} className="bg-yellow-200">{part}</mark> : 
          <React.Fragment key={i}>{part}</React.Fragment>;
      });
    } catch (error) {
      console.error("Error highlighting text:", error);
      return text;
    }
  };
  
  return <div className="whitespace-pre-wrap">{getHighlightedText()}</div>;
};

export default TextMessage;
