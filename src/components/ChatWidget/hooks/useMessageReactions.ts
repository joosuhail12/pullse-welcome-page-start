
import { useState, useCallback } from 'react';
import { Message } from '../types';
import { publishToChannel } from '../utils/ably';
import { dispatchChatEvent } from '../utils/events';
import { ChatWidgetConfig } from '../config';

export function useMessageReactions(
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  chatChannelName: string,
  sessionId: string,
  config?: ChatWidgetConfig
) {
  const [reactionsMap, setReactionsMap] = useState<Record<string, 'thumbsUp' | 'thumbsDown'>>({});

  const handleMessageReaction = useCallback((messageId: string, reaction: 'thumbsUp' | 'thumbsDown') => {
    // Update local state with the reaction
    setMessages(prevMessages => 
      prevMessages.map(message => 
        message.id === messageId 
          ? { ...message, reaction: message.reaction === reaction ? null : reaction } 
          : message
      )
    );

    // Track reaction in the map
    setReactionsMap(prev => {
      const newMap = { ...prev };
      if (prev[messageId] === reaction) {
        delete newMap[messageId]; // Toggle off if same reaction
      } else {
        newMap[messageId] = reaction;
      }
      return newMap;
    });

    // If realtime is enabled, publish reaction to the channel
    if (config?.realtime?.enabled) {
      publishToChannel(chatChannelName, 'reaction', {
        messageId,
        reaction,
        userId: sessionId,
        timestamp: new Date()
      });
    }

    // Dispatch reaction event
    dispatchChatEvent('message:reacted', { 
      messageId, 
      reaction,
      timestamp: new Date() 
    });
  }, [messages, setMessages, chatChannelName, sessionId, config]);

  return {
    reactionsMap,
    handleMessageReaction
  };
}
