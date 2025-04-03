
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TextMessageProps {
  text: string;
  renderText?: (text: string) => React.ReactNode;
  highlightText?: string;
}

const TextMessage = ({ text, renderText, highlightText }: TextMessageProps) => {
  const isMobile = useIsMobile();
  const textSizeClass = isMobile 
    ? "text-xs sm:text-sm leading-tight" 
    : "text-sm sm:text-base leading-relaxed";
  
  const highlightMatches = (text: string, term?: string) => {
    if (!term || term.trim() === '') return text;
    
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === term?.toLowerCase() 
            ? <mark key={i} className="bg-yellow-200 px-0.5 rounded">{part}</mark> 
            : part
        )}
      </>
    );
  };
  
  const content = highlightText 
    ? highlightMatches(text, highlightText)
    : (renderText ? renderText(text) : text);
  
  return (
    <p className={`${textSizeClass} tracking-wide break-words`}>{content}</p>
  );
};

export default TextMessage;
