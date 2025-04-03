
import { useState, useCallback, useEffect, useRef } from 'react';
import { sendTypingIndicator } from '../utils/messageHandlers';

interface TypingMetrics {
  lastTypedAt: number;
  typingBursts: number;
  averageTypingSpeed: number;
}

export function useTypingIndicator(
  chatChannelName: string,
  sessionId: string,
  realtimeEnabled: boolean
) {
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Track user typing patterns to adapt debounce time
  const typingMetrics = useRef<TypingMetrics>({
    lastTypedAt: 0,
    typingBursts: 0,
    averageTypingSpeed: 2000, // Default to 2 seconds
  });
  
  // Track if we've already sent a typing:start to avoid duplicates
  const isTypingActive = useRef<boolean>(false);
  
  // Debounce time that adapts based on typing speed (between 1-3 seconds)
  const getDebounceTime = useCallback(() => {
    // If user is a slow typer, use longer debounce
    return Math.min(Math.max(typingMetrics.current.averageTypingSpeed, 1000), 3000);
  }, []);
  
  // Clear typing timeout when component unmounts
  const clearTypingTimeoutCallback = useCallback(() => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
  }, [typingTimeout]);

  // Send typing:start event if not already active
  const sendTypingStart = useCallback(() => {
    if (!realtimeEnabled || isTypingActive.current) return;
    
    isTypingActive.current = true;
    sendTypingIndicator(chatChannelName, sessionId, 'start');
  }, [chatChannelName, sessionId, realtimeEnabled]);
  
  // Reset typing state and send typing:stop event
  const sendTypingStop = useCallback(() => {
    if (!realtimeEnabled || !isTypingActive.current) return;
    
    isTypingActive.current = false;
    sendTypingIndicator(chatChannelName, sessionId, 'stop');
  }, [chatChannelName, sessionId, realtimeEnabled]);

  // Handle user typing with intelligent debouncing
  const handleTypingTimeout = useCallback(() => {
    if (!realtimeEnabled) return;
    
    // Adaptive typing metrics calculation
    const now = Date.now();
    if (typingMetrics.current.lastTypedAt > 0) {
      const timeSinceLastType = now - typingMetrics.current.lastTypedAt;
      
      // Only consider reasonable typing pauses (under 5 seconds)
      if (timeSinceLastType < 5000) {
        // Increment burst count and adjust average
        typingMetrics.current.typingBursts++;
        
        // Weighted average leaning toward recent typing speed
        typingMetrics.current.averageTypingSpeed = 
          (typingMetrics.current.averageTypingSpeed * 2 + timeSinceLastType) / 3;
      }
    }
    typingMetrics.current.lastTypedAt = now;
    
    // Send typing:start
    sendTypingStart();
    
    // Clear previous timeout to avoid multiple typing:stop events
    clearTypingTimeoutCallback();
    
    // Get adaptive debounce time
    const debounceTime = getDebounceTime();
    
    // Set timeout for typing:stop
    const timeout = setTimeout(() => {
      sendTypingStop();
    }, debounceTime);
    
    setTypingTimeout(timeout);
  }, [chatChannelName, sessionId, clearTypingTimeoutCallback, realtimeEnabled, sendTypingStart, sendTypingStop, getDebounceTime]);

  // Force stop typing when unmounting or disabling realtime
  useEffect(() => {
    // When realtimeEnabled changes to false, send stop event
    if (!realtimeEnabled && isTypingActive.current) {
      sendTypingStop();
    }
    
    // Cleanup on unmount
    return () => {
      if (isTypingActive.current) {
        sendTypingStop();
      }
      clearTypingTimeoutCallback();
    };
  }, [realtimeEnabled, clearTypingTimeoutCallback, sendTypingStop]);

  return {
    handleTypingTimeout,
    clearTypingTimeout: clearTypingTimeoutCallback
  };
}
