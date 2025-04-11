
import { useState, useCallback } from 'react';
import { Message } from '../types';
import { createUserMessage, createSystemMessage, sendTypingIndicator } from '../utils/messageHandlers';
import { publishToChannel } from '../utils/ably';
import { dispatchChatEvent } from '../utils/events';
import { ChatWidgetConfig } from '../config';

export function useMessageActions(
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  chatChannelName: string,
  sessionId: string,
  config?: ChatWidgetConfig,
  setHasUserSentMessage?: React.Dispatch<React.SetStateAction<boolean>>,
  setIsTyping?: React.Dispatch<React.SetStateAction<boolean>>
) {
  const [messageText, setMessageText] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Handle sending messages
  const handleSendMessage = useCallback(async (text?: string, type: 'text' | 'file' | 'card' = 'text', metadata?: Record<string, any>) => {
    const messageContent = text || messageText;
    if (!messageContent?.trim() && type === 'text') return;

    // Create a new user message
    const userMessage = createUserMessage(messageContent, type, metadata);
    
    // Add message to state
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Clear input field if this is a text message
    if (type === 'text') {
      setMessageText('');
    }
    
    // Mark that user has sent at least one message
    if (setHasUserSentMessage) {
      setHasUserSentMessage(true);
    }
    
    // Stop typing indicator if active
    if (setIsTyping) {
      setIsTyping(false);
      sendTypingIndicator(chatChannelName, sessionId, 'stop');
    }
    
    // Check if this is a new conversation (contactevent channel) or existing conversation
    const isNewConversation = chatChannelName.includes('contactevent');
    
    // Publish message to the appropriate channel
    if (config?.realtime) {
      publishToChannel(chatChannelName, 'message', {
        id: userMessage.id,
        text: userMessage.text,
        sender: userMessage.sender,
        sessionId: sessionId, // Include sessionId for contact events
        timestamp: userMessage.createdAt,
        type: userMessage.type,
        ...(metadata && { metadata })
      });
      
      // Dispatch event for the message
      dispatchChatEvent('chat:messageSent', { message: userMessage }, config);
    }
    
    // If this channel is for contact events, show a response message
    if (isNewConversation) {
      setTimeout(() => {
        const autoResponseMessage = createSystemMessage(
          'Thanks for your message! Our team will get back to you shortly.',
          'text'
        );
        
        setMessages(prevMessages => [...prevMessages, autoResponseMessage]);
      }, 1000);
    }
  }, [messageText, setMessages, chatChannelName, sessionId, config, setHasUserSentMessage, setIsTyping]);

  // Handle user typing
  const handleUserTyping = useCallback(() => {
    if (setIsTyping) {
      setIsTyping(true);
      sendTypingIndicator(chatChannelName, sessionId, 'start');
    }
  }, [chatChannelName, sessionId, setIsTyping]);

  // Handle file uploads
  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      // Create a simple file message for now
      // In a real implementation, this would upload the file to a server
      const fileMessage = `Uploaded file: ${file.name} (${Math.round(file.size / 1024)}KB)`;
      
      // Send the file message
      await handleSendMessage(fileMessage, 'file', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      
      // Add error message to chat
      setMessages(prevMessages => [
        ...prevMessages,
        createSystemMessage('Failed to upload file. Please try again later.')
      ]);
    } finally {
      setIsUploading(false);
    }
  }, [handleSendMessage, setMessages]);

  // Handle ending chat
  const handleEndChat = useCallback(() => {
    // Add end chat message
    const endChatMessage = createSystemMessage('Chat ended', 'text');
    setMessages(prevMessages => [...prevMessages, endChatMessage]);
    
    // Publish end chat event to channel
    if (config?.realtime) {
      publishToChannel(chatChannelName, 'endChat', {
        sessionId,
        timestamp: new Date()
      });
    }
    
    // Dispatch end chat event
    dispatchChatEvent('chat:ended', { timestamp: new Date() }, config);
  }, [chatChannelName, sessionId, config, setMessages]);

  return {
    messageText,
    setMessageText,
    isUploading,
    handleSendMessage,
    handleUserTyping,
    handleFileUpload,
    handleEndChat
  };
}
