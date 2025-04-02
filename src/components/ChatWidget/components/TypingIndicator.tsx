
import React from 'react';

const TypingIndicator = () => {
  // Define the keyframes animation in a style
  const dotAnimationStyle = {
    animation: 'typingDot 1.4s infinite ease-in-out',
  };

  return (
    <div className="flex justify-start">
      <div className="bg-gray-100 rounded-lg p-3 rounded-bl-none max-w-[80%] shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200/30">
        <div className="flex space-x-1.5">
          <div 
            className="w-2 h-2 bg-vivid-purple-400 rounded-full" 
            style={{ 
              ...dotAnimationStyle,
              animationDelay: '0ms'
            }}
          />
          <div 
            className="w-2 h-2 bg-vivid-purple-500 rounded-full" 
            style={{ 
              ...dotAnimationStyle,
              animationDelay: '160ms'
            }}
          />
          <div 
            className="w-2 h-2 bg-vivid-purple-600 rounded-full" 
            style={{ 
              ...dotAnimationStyle,
              animationDelay: '320ms'
            }}
          />
        </div>
      </div>
      
      {/* Add the keyframes animation to the document head */}
      <style>
        {`
          @keyframes typingDot {
            0%, 100% {
              transform: translateY(0);
              opacity: 0.6;
            }
            50% {
              transform: translateY(-4px);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default TypingIndicator;
