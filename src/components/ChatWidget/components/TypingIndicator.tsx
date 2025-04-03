
import React from 'react';

const TypingIndicator = () => {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-100 rounded-lg p-3 rounded-bl-none max-w-[80%] shadow-sm">
        <div className="flex space-x-1.5">
          <div className="w-2.5 h-2.5 bg-vivid-purple rounded-full animate-typing-bounce" 
               style={{ animationDelay: '0ms', animationDuration: '0.8s' }}></div>
          <div className="w-2.5 h-2.5 bg-vivid-purple rounded-full animate-typing-bounce" 
               style={{ animationDelay: '200ms', animationDuration: '0.8s' }}></div>
          <div className="w-2.5 h-2.5 bg-vivid-purple rounded-full animate-typing-bounce" 
               style={{ animationDelay: '400ms', animationDuration: '0.8s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
