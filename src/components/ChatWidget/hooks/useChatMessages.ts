
import { useState, useEffect } from 'react';
import { Message, Conversation } from '../types';
import { ChatWidgetConfig } from '../config';
import { dispatchChatEvent } from '../utils/events';
import { 
  subscribeToChannel, 
  publishToChannel 
} from '../utils/ably';
import { getChatSessionId } from '../utils/cookies';

export function useChatMessages(
  conversation: Conversation,
  config?: ChatWidgetConfig,
  onUpdateConversation?: (updatedConversation: Conversation) => void
) {
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>(
    conversation.messages || [
      {
        id: 'msg-1',
        text: 'Hello! How can I help you today?',
        sender: 'system',
        timestamp: new Date(),
        type: 'text'
      }
    ]
  );
  const [isTyping, setIsTyping] = useState(false);
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Create channel name based on conversation
  const chatChannelName = `conversation:${conversation.id}`;
  const sessionId = getChatSessionId();

  useEffect(() => {
    // Update conversation in parent component when messages change
    if (messages.length > 0 && onUpdateConversation) {
      const updatedConversation = {
        ...conversation,
        messages: messages,
        lastMessage: messages[messages.length - 1].text,
        timestamp: messages[messages.length - 1].timestamp,
        sessionId: sessionId
      };
      onUpdateConversation(updatedConversation);
    }
  }, [messages, conversation, onUpdateConversation, sessionId]);

  useEffect(() => {
    // If realtime is enabled, subscribe to the conversation channel
    if (config?.realtime?.enabled && conversation.id) {
      // Subscribe to new messages
      const channel = subscribeToChannel(
        chatChannelName,
        'message',
        (message) => {
          if (message.data && message.data.sender === 'system') {
            const newMessage: Message = {
              id: message.data.id || `msg-${Date.now()}-system`,
              text: message.data.text,
              sender: 'system',
              timestamp: new Date(message.data.timestamp || Date.now()),
              type: message.data.type || 'text'
            };
            
            setMessages(prev => [...prev, newMessage]);
            
            // Dispatch message received event
            dispatchChatEvent('chat:messageReceived', { message: newMessage }, config);
          }
        }
      );

      // Subscribe to typing indicators
      subscribeToChannel(
        chatChannelName,
        'typing',
        (message) => {
          if (message.data && message.data.status) {
            setIsTyping(message.data.status === 'start');
          }
        }
      );

      // Clean up subscriptions on unmount
      return () => {
        if (channel) {
          channel.unsubscribe();
        }
      };
    } else {
      // Fallback to the original behavior when realtime is disabled
      const simulateAgentTyping = () => {
        if (!hasUserSentMessage) return;
        
        const randomTimeout = Math.floor(Math.random() * 10000) + 5000;
        const typingTimer = setTimeout(() => {
          setIsTyping(true);
          
          const typingDuration = Math.floor(Math.random() * 2000) + 1000;
          setTimeout(() => {
            setIsTyping(false);
            
            const responseDelay = Math.floor(Math.random() * 400) + 200;
            setTimeout(() => {
              const responses = [
                "Thank you for your message. Is there anything else I can help with?",
                "I appreciate your inquiry. Let me know if you need further assistance.",
                "I've made a note of your request. Is there any other information you'd like to provide?",
                "Thanks for sharing that information. Do you have any other questions?"
              ];
              
              const randomResponse = responses[Math.floor(Math.random() * responses.length)];
              
              const systemMessage: Message = {
                id: `msg-${Date.now()}-system`,
                text: randomResponse,
                sender: 'system',
                timestamp: new Date(),
                type: 'text'
              };
              
              setMessages(prev => [...prev, systemMessage]);
              
              // Dispatch message received event
              dispatchChatEvent('chat:messageReceived', { message: systemMessage }, config);
            }, responseDelay);
          }, typingDuration);
        }, randomTimeout);
        
        setTypingTimeout(typingTimer);
        return () => clearTimeout(typingTimer);
      };
      
      const typingInterval = setInterval(simulateAgentTyping, 15000);
      return () => {
        clearInterval(typingInterval);
        if (typingTimeout) {
          clearTimeout(typingTimeout);
        }
      };
    }
  }, [hasUserSentMessage, config?.realtime?.enabled, chatChannelName, conversation.id, typingTimeout, config]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };
    
    setMessages([...messages, userMessage]);
    setMessageText('');
    
    // Dispatch message sent event
    dispatchChatEvent('chat:messageSent', { message: userMessage }, config);
    
    if (!hasUserSentMessage) {
      setHasUserSentMessage(true);
    }
    
    // If realtime is enabled, publish the message to the channel
    if (config?.realtime?.enabled) {
      publishToChannel(chatChannelName, 'message', {
        id: userMessage.id,
        text: userMessage.text,
        sender: userMessage.sender,
        timestamp: userMessage.timestamp,
        type: userMessage.type
      });
    } else {
      // Fallback to the original behavior
      setIsTyping(true);
      
      setTimeout(() => {
        setIsTyping(false);
        
        const systemMessage: Message = {
          id: `msg-${Date.now()}-system`,
          text: 'Thank you for your message. How else can I assist you today?',
          sender: 'system',
          timestamp: new Date(),
          type: 'text'
        };
        
        setMessages(prev => [...prev, systemMessage]);
        
        // Dispatch message received event
        dispatchChatEvent('chat:messageReceived', { message: systemMessage }, config);
      }, Math.floor(Math.random() * 400) + 200);
    }
  };

  const handleUserTyping = () => {
    // If realtime is enabled, send typing indicator
    if (config?.realtime?.enabled) {
      publishToChannel(chatChannelName, 'typing', {
        status: 'start',
        userId: sessionId
      });
      
      // Clear previous timeout to avoid multiple typing:stop events
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      // Send typing:stop after 2 seconds of no typing
      const timeout = setTimeout(() => {
        publishToChannel(chatChannelName, 'typing', {
          status: 'stop',
          userId: sessionId
        });
      }, 2000);
      
      setTypingTimeout(timeout);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    const fileMessage: Message = {
      id: `msg-${Date.now()}-user-file`,
      text: `Uploaded: ${file.name}`,
      sender: 'user',
      timestamp: new Date(),
      type: 'file',
      fileName: file.name,
      fileUrl: URL.createObjectURL(file)
    };
    
    setMessages([...messages, fileMessage]);
    
    // Dispatch message sent event for file
    dispatchChatEvent('chat:messageSent', { message: fileMessage, isFile: true }, config);
    
    if (!hasUserSentMessage) {
      setHasUserSentMessage(true);
    }
    
    e.target.value = '';
    
    // If realtime is enabled, publish the file message to the channel
    if (config?.realtime?.enabled) {
      publishToChannel(chatChannelName, 'message', {
        id: fileMessage.id,
        text: fileMessage.text,
        sender: fileMessage.sender,
        timestamp: fileMessage.timestamp,
        type: fileMessage.type,
        fileName: fileMessage.fileName
        // Note: We're not sending the actual file URL as it's a local blob URL
      });
    } else {
      // Fallback to the original behavior
      setTimeout(() => {
        const systemMessage: Message = {
          id: `msg-${Date.now()}-system`,
          text: `I've received your file ${file.name}. Is there anything specific you'd like me to help with regarding this file?`,
          sender: 'system',
          timestamp: new Date(),
          type: 'text'
        };
        
        setMessages(prev => [...prev, systemMessage]);
        
        // Dispatch message received event
        dispatchChatEvent('chat:messageReceived', { message: systemMessage }, config);
      }, 1000);
    }
  };

  const handleEndChat = () => {
    const statusMessage: Message = {
      id: `msg-${Date.now()}-status`,
      text: 'Chat ended',
      sender: 'status',
      timestamp: new Date(),
      type: 'status'
    };
    
    setMessages(prev => [...prev, statusMessage]);
    
    // Dispatch chat close event
    dispatchChatEvent('chat:close', { endedByUser: true }, config);
    
    // If realtime is enabled, publish the end chat event
    if (config?.realtime?.enabled) {
      publishToChannel(chatChannelName, 'end', {
        timestamp: new Date(),
        userId: sessionId
      });
    }
  };

  return {
    messages,
    messageText,
    setMessageText,
    isTyping,
    hasUserSentMessage,
    handleSendMessage,
    handleUserTyping,
    handleFileUpload,
    handleEndChat
  };
}
