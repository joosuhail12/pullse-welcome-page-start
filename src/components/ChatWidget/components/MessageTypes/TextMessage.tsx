
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TextMessageProps {
  text: string;
  renderText: (text: string) => React.ReactNode;
}

const TextMessage = ({ text, renderText }: TextMessageProps) => {
  const isMobile = useIsMobile();
  const textSizeClass = isMobile 
    ? "text-sm leading-tight" 
    : "text-sm sm:text-base leading-relaxed";
  
  return (
    <p className={`${textSizeClass} tracking-wide break-words`}>{renderText(text)}</p>
  );
};

export default TextMessage;
