
import { useState, useEffect, useCallback } from 'react';
import { publishToChannel } from '../utils/ably/messaging';

// The error was that sendTypingIndicator was not exported from messageHandlers
// So we'll implement the typing indicator sending here instead

export function useTypingIndicator(
  conversationId: string,
  sessionId: string,
  channelName: string | null,
  isTyping: boolean
) {
  const [isTypingLocal, setIsTypingLocal] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Function to send typing status to channel
  const sendTypingStatus = useCallback((status: 'start' | 'stop') => {
    if (!channelName) return;
    
    publishToChannel(channelName, 'typing', {
      userId: sessionId,
      conversationId,
      status,
      timestamp: new Date()
    });
  }, [channelName, sessionId, conversationId]);

  // Handle typing state changes
  useEffect(() => {
    if (isTyping && !isTypingLocal) {
      setIsTypingLocal(true);
      sendTypingStatus('start');
      
      // Clear existing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      // Set timeout to stop typing indicator after 3 seconds
      const timeout = setTimeout(() => {
        setIsTypingLocal(false);
        sendTypingStatus('stop');
      }, 3000);
      
      setTypingTimeout(timeout);
    }
    
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [isTyping, isTypingLocal, sendTypingStatus, typingTimeout]);

  return { isTypingLocal };
}
