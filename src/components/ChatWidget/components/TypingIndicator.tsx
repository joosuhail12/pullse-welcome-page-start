
import React, { useEffect, useState } from 'react';

interface TypingIndicatorProps {
  typingDuration?: number;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingDuration = 0 }) => {
  // Show different indicators based on typing duration
  const [indicatorState, setIndicatorState] = useState<'thinking' | 'typing' | 'paused'>('typing');
  
  // Update indicator state based on how long typing has been happening
  useEffect(() => {
    if (typingDuration > 10000) {
      // If typing for more than 10 seconds, show "thinking" animation
      setIndicatorState('thinking');
    } else if (typingDuration > 5000) {
      // If typing for more than 5 seconds, show "paused" animation
      setIndicatorState('paused');
    } else {
      // Normal typing
      setIndicatorState('typing');
    }
  }, [typingDuration]);

  return (
    <div className="flex justify-start">
      <div className="bg-gray-100 rounded-lg p-3 rounded-bl-none max-w-[80%] shadow-sm">
        <div className="flex space-x-1.5">
          <div 
            className={`w-2.5 h-2.5 bg-vivid-purple rounded-full ${
              indicatorState === 'paused' ? 'animate-pulse' : 'animate-typing-bounce'
            }`} 
            style={{ 
              animationDelay: '0ms', 
              animationDuration: indicatorState === 'thinking' ? '1.2s' : '0.8s' 
            }}
          />
          <div 
            className={`w-2.5 h-2.5 bg-vivid-purple rounded-full ${
              indicatorState === 'paused' ? 'animate-pulse' : 'animate-typing-bounce'
            }`} 
            style={{ 
              animationDelay: '200ms', 
              animationDuration: indicatorState === 'thinking' ? '1.2s' : '0.8s' 
            }}
          />
          <div 
            className={`w-2.5 h-2.5 bg-vivid-purple rounded-full ${
              indicatorState === 'paused' ? 'animate-pulse' : 'animate-typing-bounce'
            }`}
            style={{ 
              animationDelay: '400ms', 
              animationDuration: indicatorState === 'thinking' ? '1.2s' : '0.8s' 
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
