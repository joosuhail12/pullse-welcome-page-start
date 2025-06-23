
import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

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
    <div className={`flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-blue-200/60 shadow-sm max-w-[90%] mx-auto ${className}`}>
      {/* AI Avatar */}
      <div className="flex-shrink-0 relative">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
          <Bot size={18} className="text-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
          <Sparkles size={8} className="text-white" />
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-blue-700">AI Assistant</span>
          {isTyping && (
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          )}
        </div>
        
        <div className="text-sm text-gray-800 leading-relaxed">
          {renderText ? renderText(text) : text}
        </div>
        
        {timestamp && (
          <div className="mt-2 text-xs text-blue-600/70">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIMessage;
