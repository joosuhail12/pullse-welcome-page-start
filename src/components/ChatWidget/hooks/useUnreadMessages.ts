
import { useState, useEffect, useCallback } from 'react';
import { subscribeToChannel } from '../utils/ably';
import { getChatSessionId } from '../utils/cookies';

export function useUnreadMessages() {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const sessionId = getChatSessionId();
  
  // Subscribe to new messages in all channels
  useEffect(() => {
    // Subscribe to the general messages channel for this session
    const channel = subscribeToChannel(
      `session:${sessionId}`,
      'message',
      () => {
        // Increment unread count when new message is received
        setUnreadCount((prev) => prev + 1);
      }
    );

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [sessionId]);

  const clearUnreadMessages = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return {
    unreadCount,
    clearUnreadMessages
  };
}
