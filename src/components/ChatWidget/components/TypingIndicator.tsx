
import React from 'react';

const TypingIndicator = () => {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-100 rounded-lg p-3 rounded-bl-none max-w-[80%] shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex space-x-1.5">
          <div className="w-2.5 h-2.5 bg-vivid-purple-400 rounded-full animate-float" 
               style={{ animationDelay: '0ms', animationDuration: '1.2s' }}></div>
          <div className="w-2.5 h-2.5 bg-vivid-purple-500 rounded-full animate-float" 
               style={{ animationDelay: '200ms', animationDuration: '1.2s' }}></div>
          <div className="w-2.5 h-2.5 bg-vivid-purple-600 rounded-full animate-float" 
               style={{ animationDelay: '400ms', animationDuration: '1.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
