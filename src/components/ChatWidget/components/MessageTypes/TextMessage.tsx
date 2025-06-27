
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

    // Case-insensitive search
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, i) =>
          regex.test(part)
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
    <p className={`${textSizeClass} tracking-wide break-words text-left`}>{content}</p>
  );
};

export default TextMessage;
