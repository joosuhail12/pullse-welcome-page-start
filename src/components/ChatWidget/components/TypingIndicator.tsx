
import React from 'react';

const TypingIndicator = React.memo(() => {
  return (
    <div className="flex justify-start" role="status" aria-label="Agent is typing">
      <div className="bg-gray-100 rounded-lg p-3 rounded-bl-none max-w-[80%] shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200/30">
        <div className="flex space-x-1.5">
          <div 
            className="w-2 h-2 bg-vivid-purple-400 rounded-full animate-typing-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <div 
            className="w-2 h-2 bg-vivid-purple-500 rounded-full animate-typing-bounce"
            style={{ animationDelay: '160ms' }}
          />
          <div 
            className="w-2 h-2 bg-vivid-purple-600 rounded-full animate-typing-bounce"
            style={{ animationDelay: '320ms' }}
          />
        </div>
      </div>
    </div>
  );
});

TypingIndicator.displayName = 'TypingIndicator';

export default TypingIndicator;
