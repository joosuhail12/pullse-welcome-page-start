
import React from 'react';
import { cn } from '@/lib/utils';

interface TextMessageProps {
  text: string;
  highlightText?: string;
  className?: string;
}

const TextMessage: React.FC<TextMessageProps> = ({
  text,
  highlightText,
  className
}) => {
  // Function to highlight part of the text
  const highlightMatches = () => {
    if (!highlightText?.trim()) {
      return <span>{text}</span>;
    }

    const regex = new RegExp(`(${highlightText})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <>
        {parts.map((part, index) => {
          const isMatch = part.toLowerCase() === highlightText.toLowerCase();
          return isMatch ? (
            <mark key={index} className="bg-yellow-200 rounded px-0.5">{part}</mark>
          ) : (
            <React.Fragment key={index}>{part}</React.Fragment>
          );
        })}
      </>
    );
  };

  return (
    <div className={cn("whitespace-pre-wrap break-words", className)}>
      {highlightText ? highlightMatches() : text}
    </div>
  );
};

export default TextMessage;
