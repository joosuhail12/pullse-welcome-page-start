
import { useState, useEffect, useCallback } from 'react';
import { subscribeToChannel } from '../utils/ably';
import { getChatSessionId } from '../utils/storage';

// Key for storing unread count in localStorage
const UNREAD_COUNT_KEY = 'chat_widget_unread_count';

export function useUnreadMessages() {
  // Initialize from localStorage if available
  const initialCount = localStorage.getItem(UNREAD_COUNT_KEY) 
    ? parseInt(localStorage.getItem(UNREAD_COUNT_KEY) || '0', 10) 
    : 0;

  const [unreadCount, setUnreadCount] = useState<number>(initialCount);
  const [sessionId, setSessionId] = useState<string | null>(getChatSessionId());
  
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
    // Only subscribe if we have a valid session ID
    if (!sessionId) {
      console.warn('Cannot subscribe to messages channel: No session ID available');
      return;
    }
    
    // Make sure to avoid invalid channel names
    const channelName = `session:${sessionId}`;
    if (!channelName || 
        channelName.includes('null') || 
        channelName.includes('undefined') ||
        channelName === 'session:null' ||
        channelName === 'session:undefined') {
      console.warn(`Invalid session channel name: ${channelName}, not subscribing`);
      return;
    }
    
    let channel;
    // Try-catch to prevent errors if Ably is not initialized yet
    try {
      // Subscribe to the general messages channel for this session
      channel = subscribeToChannel(
        channelName,
        'message',
        () => {
          // Increment unread count when new message is received
          setUnreadCount((prev) => prev + 1);
        }
      );
    } catch (error) {
      console.error('Error subscribing to message channel:', error);
    }

    return () => {
      if (channel) {
        try {
          channel.unsubscribe();
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
    };
  }, [sessionId]);
  
  // Update session ID if it changes
  useEffect(() => {
    const checkSessionId = () => {
      const currentSessionId = getChatSessionId();
      if (currentSessionId !== sessionId && currentSessionId !== null) {
        setSessionId(currentSessionId);
      }
    };
    
    // Check for session ID changes periodically
    const intervalId = setInterval(checkSessionId, 2000);
    
    return () => {
      clearInterval(intervalId);
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
