
import React from 'react';
import { Bot } from 'lucide-react';

interface AIMessageProps {
  text: string;
  renderText?: (text: string) => React.ReactNode;
  className?: string;
  timestamp?: Date;
  isTyping?: boolean;
  streamingStatus?: string | null;
}

const AIMessage = ({
  text,
  renderText,
  className = '',
  timestamp,
  isTyping = false,
  streamingStatus
}: AIMessageProps) => {
  return (
    <div className={`text-sm text-gray-800 leading-relaxed ${className}`}>
      {isTyping && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-blue-600">
            <Bot size={14} />
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
          {streamingStatus && (
            <span className="text-xs text-gray-500 italic">{streamingStatus}</span>
          )}
        </div>
      )}
      {!isTyping && (renderText ? renderText(text) : text)}
    </div>
  );
};

export default AIMessage;
