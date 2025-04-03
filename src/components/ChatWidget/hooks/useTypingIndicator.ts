import { useState, useCallback, useRef } from 'react';
import { sendTypingIndicator } from '../utils/messageHandlers';

interface TypingIndicatorHook {
  handleTypingTimeout: () => void;
  clearTypingTimeout: () => void;
}

export const useTypingIndicator = (
  channelName?: string,
  sessionId?: string,
  realtimeEnabled?: boolean
): TypingIndicatorHook => {
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear any existing typing timeout
  const clearTypingTimeout = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, []);

  // Handle typing timeout - reset typing state after delay
  const handleTypingTimeout = useCallback(() => {
    clearTypingTimeout();
    
    // Send typing indicator if realtime is enabled
    if (realtimeEnabled && channelName && sessionId) {
      sendTypingIndicator(channelName, sessionId, 'start');
    }
    
    // Set new timeout to clear typing indicator after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (realtimeEnabled && channelName && sessionId) {
        sendTypingIndicator(channelName, sessionId, 'stop');
      }
    }, 3000);
  }, [clearTypingTimeout, channelName, sessionId, realtimeEnabled]);

  return {
    handleTypingTimeout,
    clearTypingTimeout
  };
};
