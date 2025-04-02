
import React from 'react';

const ChatBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, var(--vivid-purple) 2%, transparent 0%), 
                            radial-gradient(circle at 75px 75px, var(--vivid-purple) 2%, transparent 0%)`,
          backgroundSize: '100px 100px',
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white to-transparent dark:from-gray-900 z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent dark:from-gray-900 z-10" />
    </div>
  );
};

export default ChatBackground;
