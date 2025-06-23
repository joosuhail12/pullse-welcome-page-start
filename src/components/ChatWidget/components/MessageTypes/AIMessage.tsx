
import React from 'react';
import { Bot } from 'lucide-react';

interface AIMessageProps {
  text: string;
  renderText?: (text: string) => React.ReactNode;
  className?: string;
  timestamp?: Date;
  isTyping?: boolean;
}

const AIMessage = ({ 
  text, 
  renderText, 
  className = '',
  timestamp,
  isTyping = false
}: AIMessageProps) => {
  return (
    <div className={`text-sm text-gray-800 leading-relaxed ${className}`}>
      {isTyping && (
        <div className="flex items-center gap-1 mb-2 text-blue-600">
          <Bot size={14} />
          <span className="text-xs">AI is typing</span>
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      )}
      {renderText ? renderText(text) : text}
    </div>
  );
};

export default AIMessage;
