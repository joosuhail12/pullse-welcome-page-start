
import { useState, useEffect } from 'react';

export const useAgentTyping = (conversationId: string) => {
  const [agentIsTyping, setAgentIsTyping] = useState(false);
  
  useEffect(() => {
    // Here we would listen for actual agent typing events
    // For now, just simulate occasional typing
    const typingInterval = setInterval(() => {
      const shouldShowTyping = Math.random() > 0.7;
      setAgentIsTyping(shouldShowTyping);
      
      if (shouldShowTyping) {
        // Hide typing indicator after 2-5 seconds
        setTimeout(() => {
          setAgentIsTyping(false);
        }, 2000 + Math.random() * 3000);
      }
    }, 10000);
    
    return () => {
      clearInterval(typingInterval);
    };
  }, [conversationId]);
  
  return { agentIsTyping };
};
