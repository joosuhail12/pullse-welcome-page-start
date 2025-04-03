
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TextMessageProps {
  text: string;
  renderText: (text: string) => React.ReactNode;
}

const TextMessage = ({ text, renderText }: TextMessageProps) => {
  const isMobile = useIsMobile();
  const textSizeClass = isMobile ? "text-xs sm:text-sm" : "text-sm sm:text-base";
  
  return (
    <p className={`${textSizeClass} leading-relaxed tracking-wide`}>{renderText(text)}</p>
  );
};

export default TextMessage;
