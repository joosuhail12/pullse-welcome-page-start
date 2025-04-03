
import { useState, useEffect, useCallback } from 'react';
import { subscribeToChannel } from '../utils/ably';
import { getChatSessionId } from '../utils/cookies';

// Key for storing unread count in localStorage
const UNREAD_COUNT_KEY = 'chat_widget_unread_count';

export function useUnreadMessages() {
  // Initialize from localStorage if available
  const initialCount = localStorage.getItem(UNREAD_COUNT_KEY) 
    ? parseInt(localStorage.getItem(UNREAD_COUNT_KEY) || '0', 10) 
    : 0;

  const [unreadCount, setUnreadCount] = useState<number>(initialCount);
  const sessionId = getChatSessionId();
  
  // Update localStorage when unread count changes
  useEffect(() => {
    localStorage.setItem(UNREAD_COUNT_KEY, unreadCount.toString());
    
    // Also dispatch a custom event for cross-tab synchronization
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('unread-messages-update', { 
        detail: { count: unreadCount } 
      }));
    }
  }, [unreadCount]);

  // Listen for unread count updates from other tabs
  useEffect(() => {
    const handleUnreadUpdate = (event: CustomEvent) => {
      if (event.detail && typeof event.detail.count === 'number') {
        setUnreadCount(event.detail.count);
      }
    };

    window.addEventListener('unread-messages-update', handleUnreadUpdate as EventListener);
    
    return () => {
      window.removeEventListener('unread-messages-update', handleUnreadUpdate as EventListener);
    };
  }, []);
  
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

  const incrementUnreadCount = useCallback(() => {
    setUnreadCount(prev => prev + 1);
  }, []);

  return {
    unreadCount,
    clearUnreadMessages,
    incrementUnreadCount
  };
}
