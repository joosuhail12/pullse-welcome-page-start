
import { useCallback } from 'react';
import { Message } from '../types';
import { publishToChannel } from '../utils/ably/messaging';
import { dispatchChatEvent } from '../utils/events';
import { ChatWidgetConfig } from '../config';

// Possible reaction types that align with the Message type
export type ReactionType = 'thumbsUp' | 'thumbsDown';

export function useMessageReactions(
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  channelName: string,
  sessionId: string,
  config?: ChatWidgetConfig
) {
  /**
   * Handle message reaction
   * @param messageId The ID of the message to react to
   * @param reaction The reaction type
   */
  const handleMessageReaction = useCallback(
    (messageId: string, reaction: ReactionType) => {
      // Find the message to update
      const messageIndex = messages.findIndex((msg) => msg.id === messageId);
      if (messageIndex === -1) return;

      try {
        // Update the message in state
        const updatedMessages = [...messages];
        updatedMessages[messageIndex] = {
          ...updatedMessages[messageIndex],
          reaction
        };

        // Update messages state
        setMessages(updatedMessages);

        // Publish reaction to channel if realtime is enabled
        if (channelName && config?.realtime) {
          publishToChannel(channelName, 'reaction', {
            messageId,
            userId: sessionId,
            reaction,
            timestamp: new Date()
          });
        }

        // Dispatch event
        dispatchChatEvent('message:reaction', {
          messageId,
          reaction,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error handling message reaction:', error);
      }
    },
    [messages, setMessages, channelName, sessionId, config?.realtime]
  );

  return {
    handleMessageReaction
  };
}
