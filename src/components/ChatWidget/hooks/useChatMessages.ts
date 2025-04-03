
import { useState, useCallback, useEffect, useRef } from 'react';
import { useTypingIndicator } from './useTypingIndicator';
import { Conversation, Message } from '../types';
import { ChatWidgetConfig } from '../config';
import { dispatchChatEvent } from '../utils/events';
import { v4 as uuidv4 } from 'uuid';
import { isTestMode, simulateAgentTypingInTestMode, simulateAgentResponseInTestMode } from '../utils/testMode';

export const useChatMessages = (
  conversation: Conversation,
  config: ChatWidgetConfig,
  onUpdateConversation: (updatedConversation: Conversation) => void,
  playMessageSound?: () => void
) => {
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [remoteIsTyping, setRemoteIsTyping] = useState(false);
  const [hasUserSentMessage, setHasUserSentMessage] = useState(conversation?.messages?.length > 0);
  const [readReceipts, setReadReceipts] = useState<Record<string, boolean>>({});
  
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const testModeTypingRef = useRef<{ cancel: () => void } | null>(null);
  
  // Track typing state
  const { sendTypingIndicator, stopTypingIndicator } = useTypingIndicator(
    conversation?.id || '',
    config
  );
  
  // Handle user typing
  const handleUserTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      if (!isTestMode()) {
        sendTypingIndicator();
      }
    }
    
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    
    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false);
      if (!isTestMode()) {
        stopTypingIndicator();
      }
    }, 1500);
  }, [isTyping, sendTypingIndicator, stopTypingIndicator]);

  // Send message
  const handleSendMessage = useCallback(() => {
    if (!messageText.trim()) return;
    
    // Create message
    const newMessage: Message = {
      id: uuidv4(),
      text: messageText.trim(),
      sender: 'user',
      timestamp: new Date(),
      status: 'sent'
    };
    
    // Update conversation with new message
    const updatedMessages = [...(conversation.messages || []), newMessage];
    const updatedConversation = {
      ...conversation,
      messages: updatedMessages,
      preview: newMessage.text,
      timestamp: new Date()
    };
    
    onUpdateConversation(updatedConversation);
    setMessageText('');
    setHasUserSentMessage(true);
    
    // Dispatch event
    dispatchChatEvent('chat:messageSent', {
      message: newMessage,
      conversationId: conversation.id,
      testMode: isTestMode()
    });
    
    // If in test mode, simulate agent typing and response
    if (isTestMode()) {
      // Cancel any previous test typing simulation
      if (testModeTypingRef.current) {
        testModeTypingRef.current.cancel();
      }
      
      // Show typing indicator
      setRemoteIsTyping(true);
      
      // Simulate agent typing and then responding
      testModeTypingRef.current = simulateAgentTypingInTestMode(() => {
        setRemoteIsTyping(false);
        
        // Generate an appropriate test response based on the message content
        let responseText = "Thank you for your message. This is a test response in test mode.";
        
        const lowerCaseText = messageText.toLowerCase();
        if (lowerCaseText.includes('hello') || lowerCaseText.includes('hi')) {
          responseText = "Hello there! This is a test response. How can I assist you today?";
        } else if (lowerCaseText.includes('help') || lowerCaseText.includes('support')) {
          responseText = "I'd be happy to help! This is a test agent response. In real mode, you would be connected with an actual support agent.";
        } else if (lowerCaseText.includes('pricing') || lowerCaseText.includes('plan') || lowerCaseText.includes('cost')) {
          responseText = "This is a test response about pricing. In real mode, an agent would provide you with actual pricing details.";
        } else if (lowerCaseText.includes('feature') || lowerCaseText.includes('function')) {
          responseText = "This is a test response about features. In real mode, an agent would provide you with detailed information about our features.";
        }
        
        const agentResponse = simulateAgentResponseInTestMode(responseText);
        
        // Add the agent response to the conversation
        const messagesWithAgentResponse = [...updatedMessages, agentResponse];
        const conversationWithAgentResponse = {
          ...updatedConversation,
          messages: messagesWithAgentResponse,
          preview: agentResponse.text,
          timestamp: new Date()
        };
        
        onUpdateConversation(conversationWithAgentResponse);
        
        // Play sound for new message
        if (playMessageSound) {
          playMessageSound();
        }
        
        // Dispatch message received event
        dispatchChatEvent('chat:messageReceived', {
          message: agentResponse,
          conversationId: conversation.id,
          testMode: true
        });
      });
    }
  }, [messageText, conversation, onUpdateConversation, playMessageSound, sendTypingIndicator, stopTypingIndicator]);

  // Handle file upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileId = uuidv4();
    
    // Create file message
    const fileMessage: Message = {
      id: fileId,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file)
      }
    };
    
    // Update conversation with file message
    const updatedMessages = [...(conversation.messages || []), fileMessage];
    const updatedConversation = {
      ...conversation,
      messages: updatedMessages,
      timestamp: new Date(),
      preview: `Sent a file: ${file.name}`
    };
    
    onUpdateConversation(updatedConversation);
    setHasUserSentMessage(true);
    
    // If in test mode, simulate file upload and response
    if (isTestMode()) {
      // Simulate upload progress
      setTimeout(() => {
        const updatedFileMessage = {
          ...fileMessage,
          status: 'delivered'
        };
        
        const updatedMessagesWithProgress = updatedMessages.map(msg => 
          msg.id === fileId ? updatedFileMessage : msg
        );
        
        onUpdateConversation({
          ...updatedConversation,
          messages: updatedMessagesWithProgress
        });
        
        // Dispatch event
        dispatchChatEvent('message:fileUploaded', {
          fileInfo: fileMessage.fileInfo,
          messageId: fileId,
          conversationId: conversation.id,
          testMode: true
        });
        
        // Simulate agent response
        setRemoteIsTyping(true);
        testModeTypingRef.current = simulateAgentTypingInTestMode(() => {
          setRemoteIsTyping(false);
          
          const agentResponse = simulateAgentResponseInTestMode(
            `I received your file "${file.name}". This is a test response in test mode.`
          );
          
          const messagesWithAgentResponse = [...updatedMessagesWithProgress, agentResponse];
          
          onUpdateConversation({
            ...updatedConversation,
            messages: messagesWithAgentResponse,
            preview: agentResponse.text,
            timestamp: new Date()
          });
          
          // Play sound for new message
          if (playMessageSound) {
            playMessageSound();
          }
          
          // Dispatch message received event
          dispatchChatEvent('chat:messageReceived', {
            message: agentResponse,
            conversationId: conversation.id,
            testMode: true
          });
        });
      }, 1500);
    }
  }, [conversation, onUpdateConversation, playMessageSound]);

  // Handle end chat
  const handleEndChat = useCallback(() => {
    if (isTestMode()) {
      // In test mode, simulate ending the chat
      const statusMessage: Message = {
        id: uuidv4(),
        sender: 'system',
        timestamp: new Date(),
        status: 'delivered',
        systemMessage: true,
        text: 'Chat ended in test mode.'
      };
      
      const updatedMessages = [...(conversation.messages || []), statusMessage];
      const updatedConversation = {
        ...conversation,
        messages: updatedMessages,
        status: 'closed',
        timestamp: new Date()
      };
      
      onUpdateConversation(updatedConversation);
      
      // Dispatch event
      dispatchChatEvent('chat:ended', {
        conversationId: conversation.id,
        timestamp: new Date(),
        testMode: true
      });
      
      return;
    }
    
    // Normal end chat logic
    const statusMessage: Message = {
      id: uuidv4(),
      sender: 'system',
      timestamp: new Date(),
      status: 'delivered',
      systemMessage: true,
      text: 'Chat ended.'
    };
    
    const updatedMessages = [...(conversation.messages || []), statusMessage];
    const updatedConversation = {
      ...conversation,
      messages: updatedMessages,
      status: 'closed',
      timestamp: new Date()
    };
    
    onUpdateConversation(updatedConversation);
    
    // Dispatch event
    dispatchChatEvent('chat:ended', {
      conversationId: conversation.id,
      timestamp: new Date()
    });
  }, [conversation, onUpdateConversation]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      
      if (testModeTypingRef.current) {
        testModeTypingRef.current.cancel();
      }
    };
  }, []);

  // For now, we don't implement loadPreviousMessages for test mode
  const loadPreviousMessages = undefined;

  return {
    messages: conversation?.messages || [],
    messageText,
    setMessageText,
    isTyping,
    hasUserSentMessage,
    handleSendMessage,
    handleUserTyping,
    handleFileUpload,
    handleEndChat,
    remoteIsTyping,
    readReceipts,
    loadPreviousMessages
  };
};

export default useChatMessages;
