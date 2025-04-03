
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
  
  // Handle text highlighting internally if renderText isn't provided
  const renderTextContent = () => {
    if (renderText) {
      return renderText(text);
    }
    
    if (highlightText && highlightText.trim() !== '') {
      // Split by highlight term and render with highlighting
      const regex = new RegExp(`(${highlightText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const parts = text.split(regex);
      return parts.map((part, i) => 
        regex.test(part) 
          ? <mark key={i} className="bg-yellow-200 px-0.5 rounded">{part}</mark>
          : <React.Fragment key={i}>{part}</React.Fragment>
      );
    }
    
    return text;
  };
  
  return (
    <p className={`${textSizeClass} tracking-wide break-words`}>{renderTextContent()}</p>
  );
};

export default TextMessage;
