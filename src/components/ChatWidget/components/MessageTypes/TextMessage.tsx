
import React from 'react';

export interface TextMessageProps {
  text: string;
  highlightText?: string;
}

const TextMessage: React.FC<TextMessageProps> = ({ text, highlightText }) => {
  if (!highlightText) {
    return <p className="whitespace-pre-wrap break-words">{text}</p>;
  }
  
  // Simple highlighting implementation - would be replaced with the actual implementation
  const parts = text.split(new RegExp(`(${highlightText})`, 'gi'));
  
  return (
    <p className="whitespace-pre-wrap break-words">
      {parts.map((part, i) =>
        part.toLowerCase() === highlightText.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200">{part}</mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </p>
  );
};

export default TextMessage;
