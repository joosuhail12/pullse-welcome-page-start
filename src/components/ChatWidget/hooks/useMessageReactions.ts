
import { useState, useCallback, useEffect } from 'react';
import { Message } from '../types';
import { publishToChannel } from '../utils/ably';
import { ChatWidgetConfig } from '../config';

interface UseMessageReactionsOptions {
  conversationId: string;
  sessionId: string;
  config?: ChatWidgetConfig;
}

export function useMessageReactions({
  conversationId,
  sessionId,
  config
}: UseMessageReactionsOptions) {
  const [reactions, setReactions] = useState<Record<string, string>>({});
  
  // Handle adding a reaction to a message
  const addReaction = useCallback((messageId: string, reaction: string) => {
    setReactions(prev => ({
      ...prev,
      [messageId]: reaction
    }));
    
    // Publish reaction to channel if realtime is enabled
    if (config?.realtime && conversationId.includes('ticket-')) {
      const channelName = `widget:conversation:${conversationId}`;
      publishToChannel(channelName, 'reaction', {
        messageId,
        reaction,
        userId: sessionId,
        timestamp: new Date()
      });
    }
  }, [conversationId, sessionId, config]);
  
  // Handle removing a reaction from a message
  const removeReaction = useCallback((messageId: string) => {
    setReactions(prev => {
      const newReactions = { ...prev };
      delete newReactions[messageId];
      return newReactions;
    });
    
    // Publish reaction removal to channel if realtime is enabled
    if (config?.realtime === true && conversationId.includes('ticket-')) {
      const channelName = `widget:conversation:${conversationId}`;
      publishToChannel(channelName, 'reaction', {
        messageId,
        reaction: null,
        userId: sessionId,
        timestamp: new Date()
      });
    }
  }, [conversationId, sessionId, config]);
  
  return {
    reactions,
    addReaction,
    removeReaction
  };
}
