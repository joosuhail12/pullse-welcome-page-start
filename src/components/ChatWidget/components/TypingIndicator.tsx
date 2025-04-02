
import React from 'react';

const TypingIndicator = () => {
  return (
    <div className="flex justify-start animate-fade-in" role="status" aria-label="Agent is typing">
      <div className="bg-system-bubble rounded-xl p-3 rounded-bl-none max-w-[80%] shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200/30">
        <div className="flex items-end space-x-1.5 px-1">
          <div 
            className="w-2.5 h-2.5 bg-gradient-to-tr from-vivid-purple-400 to-vivid-purple-500 rounded-full animate-typing-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <div 
            className="w-2.5 h-2.5 bg-gradient-to-tr from-vivid-purple-500 to-vivid-purple-600 rounded-full animate-typing-bounce"
            style={{ animationDelay: '160ms' }}
          />
          <div 
            className="w-2.5 h-2.5 bg-gradient-to-tr from-vivid-purple-600 to-vivid-purple-700 rounded-full animate-typing-bounce"
            style={{ animationDelay: '320ms' }}
          />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
