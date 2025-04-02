
import { useState, useCallback, useEffect } from 'react';
import { sendTypingIndicator } from '../utils/messageHandlers';

export function useTypingIndicator(
  chatChannelName: string,
  sessionId: string,
  realtimeEnabled: boolean
) {
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Clear typing timeout when component unmounts
  const clearTypingTimeoutCallback = useCallback(() => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
  }, [typingTimeout]);
  
  // Handle typing indicator timeout
  const handleTypingTimeout = useCallback(() => {
    if (!realtimeEnabled) return;
    
    // Clear previous timeout to avoid multiple typing:stop events
    clearTypingTimeoutCallback();
    
    // Send typing:stop after 2 seconds of no typing
    const timeout = setTimeout(() => {
      sendTypingIndicator(chatChannelName, sessionId, 'stop');
    }, 2000);
    
    setTypingTimeout(timeout);
  }, [chatChannelName, sessionId, clearTypingTimeoutCallback, realtimeEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return clearTypingTimeoutCallback;
  }, [clearTypingTimeoutCallback]);

  return {
    handleTypingTimeout,
    clearTypingTimeout: clearTypingTimeoutCallback
  };
}
