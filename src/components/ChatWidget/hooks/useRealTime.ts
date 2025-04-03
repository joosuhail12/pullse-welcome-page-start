
import { useEffect, useState, useCallback } from 'react';
import { Message } from '../types';
import { publishToChannel, subscribeToChannel, getConnectionState } from '../utils/ably';
import { ChatWidgetConfig } from '../config';
import { getChatSessionId } from '../utils/cookies';
import { useRealtimeSubscriptions } from './useRealtimeSubscriptions';
import { useTypingIndicator } from './useTypingIndicator';
import { simulateAgentTyping } from '../utils/simulateAgentTyping';
import { useConnectionState } from './useConnectionState';
import { toast } from 'sonner';

export function useRealTime(
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  conversation: { id: string },
  hasUserSentMessage: boolean,
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>,
  config?: ChatWidgetConfig,
  playMessageSound?: () => void
) {
  // Create channel name based on conversation
  const chatChannelName = `conversation:${conversation.id}`;
  const sessionChannelName = `session:${getChatSessionId()}`;
  const sessionId = getChatSessionId();
  
  // Track pending messages that couldn't be sent due to connection issues
  const [pendingMessages, setPendingMessages] = useState<Message[]>([]);
  
  // Use the connection state hook
  const { isConnected, connectionState } = useConnectionState();
  
  // Use the realtime subscriptions hook
  const { remoteIsTyping, readReceipts } = useRealtimeSubscriptions(
    chatChannelName,
    sessionChannelName,
    sessionId,
    setMessages,
    config,
    playMessageSound
  );
  
  // Use the typing indicator hook
  const { handleTypingTimeout, clearTypingTimeout } = useTypingIndicator(
    chatChannelName, 
    sessionId, 
    !!config?.realtime?.enabled
  );

  // Function to publish a message with connection-aware error handling
  const safePublishToChannel = useCallback(async (channel: string, event: string, data: any) => {
    if (!config?.realtime?.enabled) return;
    
    try {
      if (isConnected) {
        await publishToChannel(channel, event, data);
        return true;
      } else {
        console.log('Connection is not available, queuing message for later');
        return false;
      }
    } catch (err) {
      console.error('Error publishing message:', err);
      return false;
    }
  }, [config?.realtime?.enabled, isConnected]);

  // Attempt to resend pending messages when connection is restored
  useEffect(() => {
    if (isConnected && pendingMessages.length > 0 && config?.realtime?.enabled) {
      console.log(`Connection restored. Attempting to send ${pendingMessages.length} pending messages`);
      
      const processMessages = async () => {
        const newPendingMessages = [...pendingMessages];
        const failedMessages = [];
        
        // Process each pending message
        for (const message of newPendingMessages) {
          const success = await safePublishToChannel(chatChannelName, 'message', message);
          if (!success) {
            failedMessages.push(message);
          }
        }
        
        // Update pending messages list
        if (failedMessages.length !== pendingMessages.length) {
          setPendingMessages(failedMessages);
          
          if (failedMessages.length === 0) {
            toast.success('All pending messages sent successfully');
          } else {
            toast.info(`Sent ${pendingMessages.length - failedMessages.length} messages. ${failedMessages.length} still pending.`);
          }
        }
      };
      
      processMessages();
    }
  }, [isConnected, pendingMessages, chatChannelName, config?.realtime?.enabled, safePublishToChannel]);

  // Effects for specific functionality
  useEffect(() => {
    // Process existing messages when component mounts
    if (config?.realtime?.enabled && messages.length > 0 && isConnected) {
      messages.forEach(message => {
        if (message.sender === 'system') {
          // Send read receipt for existing system messages
          publishToChannel(chatChannelName, 'read', {
            messageId: message.id,
            userId: sessionId,
            timestamp: new Date()
          }).catch(err => console.error('Error sending read receipt:', err));
        }
      });
    }
  }, [chatChannelName, config?.realtime?.enabled, messages, sessionId, isConnected]);

  // For non-realtime mode, simulate agent typing
  useEffect(() => {
    if (!config?.realtime?.enabled) {
      // Only simulate if the user has sent at least one message
      if (!hasUserSentMessage) return;
      
      const typingInterval = setInterval(() => {
        const typingTimer = simulateAgentTyping(setIsTyping, setMessages, config, playMessageSound);
        return () => clearTimeout(typingTimer);
      }, 15000);
      
      return () => {
        clearInterval(typingInterval);
        clearTypingTimeout();
      };
    }
    
    // No cleanup needed when realtime is enabled
    return () => {};
  }, [config?.realtime?.enabled, hasUserSentMessage, playMessageSound, setIsTyping, setMessages, clearTypingTimeout]);

  // Function to add a message to the pending queue
  const addPendingMessage = useCallback((message: Message) => {
    setPendingMessages(prev => [...prev, message]);
    toast.info('Message will be sent when connection is restored', {
      duration: 3000,
    });
  }, []);

  return {
    remoteIsTyping,
    readReceipts,
    chatChannelName,
    sessionId,
    handleTypingTimeout,
    connectionState,
    isConnected,
    pendingMessages,
    addPendingMessage,
    safePublishToChannel
  };
}
