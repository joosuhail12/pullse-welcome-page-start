
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '../types';
import { ChatWidgetConfig } from '../config';
import { publishToChannel } from '../utils/ably/messaging';
import { createUserMessage } from '../utils/messageHandlers';
import { dispatchChatEvent } from '../utils/events';

export function useMessageActions(
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  channelName: string | null,
  sessionId: string | null,
  config?: ChatWidgetConfig,
  setHasUserSentMessage?: React.Dispatch<React.SetStateAction<boolean>>,
  setIsTyping?: React.Dispatch<React.SetStateAction<boolean>>
) {
  const [messageText, setMessageText] = useState('');
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Handle sending text messages
  const handleSendMessage = useCallback(() => {
    const trimmedText = messageText.trim();
    
    if (trimmedText === '') {
      return null;
    }
    
    try {
      // Create message object
      const message = createUserMessage(trimmedText);
      
      // Update local state immediately
      setMessages(prevMessages => [...prevMessages, message]);
      setMessageText('');
      
      // Update user sent message flag if provided
      if (setHasUserSentMessage) {
        setHasUserSentMessage(true);
      }
      
      // Reset typing state
      if (setIsTyping) {
        setIsTyping(false);
      }
      
      // Only publish to channel if we have a valid channel name and realtime is enabled
      if (channelName && config?.realtime) {
        publishToChannel(channelName, 'message', {
          id: message.id,
          text: message.text,
          sender: message.sender,
          timestamp: message.createdAt,
          type: message.type,
          status: message.status
        });
      }
      
      // Dispatch event
      dispatchChatEvent('message:sent', {
        messageId: message.id,
        text: message.text,
        timestamp: message.createdAt
      });
      
      // Simulate successful delivery
      setTimeout(() => {
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === message.id ? { ...msg, status: 'delivered' } : msg
          )
        );
      }, 1000);
      
      // Return message for potential further processing
      return { success: true, message };
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      return { success: false };
    }
  }, [messageText, setMessages, channelName, sessionId, config?.realtime, setHasUserSentMessage, setIsTyping]);

  // Handle typing indicators
  const handleUserTyping = useCallback(() => {
    // Only send typing indicators if realtime is enabled
    if (!channelName || !config?.realtime) return;
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    try {
      // Publish typing status
      publishToChannel(channelName, 'typing', {
        userId: sessionId,
        status: 'start',
        timestamp: new Date()
      });
      
      // Set timeout to stop typing after 2 seconds of inactivity
      const newTimeout = setTimeout(() => {
        publishToChannel(channelName, 'typing', {
          userId: sessionId,
          status: 'stop',
          timestamp: new Date()
        });
      }, 2000);
      
      setTypingTimeout(newTimeout);
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  }, [channelName, sessionId, typingTimeout, config?.realtime]);

  // Handle file uploads
  const handleFileUpload = useCallback((file: File) => {
    try {
      // Implement file upload logic here
      // For now, just create a placeholder message
      const fileMessage: Message = {
        id: `file-${uuidv4()}`,
        text: `File: ${file.name}`,
        sender: 'user',
        createdAt: new Date(),
        type: 'file',
        status: 'sending',
        fileUrl: URL.createObjectURL(file),
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      };
      
      // Update local state
      setMessages(prevMessages => [...prevMessages, fileMessage]);
      
      // Update user sent message flag if provided
      if (setHasUserSentMessage) {
        setHasUserSentMessage(true);
      }
      
      // Only publish to channel if we have a valid channel name and realtime is enabled
      if (channelName && config?.realtime) {
        // In a real implementation, you would upload the file to a server first,
        // then publish the message with the file URL
        publishToChannel(channelName, 'message', {
          id: fileMessage.id,
          text: fileMessage.text,
          sender: fileMessage.sender,
          timestamp: fileMessage.createdAt,
          type: fileMessage.type,
          status: fileMessage.status,
          fileUrl: fileMessage.fileUrl,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        });
      }
      
      // Dispatch event
      dispatchChatEvent('file:upload', {
        messageId: fileMessage.id,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        timestamp: fileMessage.createdAt
      });
      
      // Simulate successful upload
      setTimeout(() => {
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === fileMessage.id ? { ...msg, status: 'delivered' } : msg
          )
        );
      }, 1500);
      
      return { success: true, message: fileMessage };
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file. Please try again.');
      return { success: false };
    }
  }, [setMessages, channelName, sessionId, config?.realtime, setHasUserSentMessage]);

  // Handle ending chat
  const handleEndChat = useCallback(() => {
    try {
      // Add status message
      const statusMessage = {
        id: `status-${uuidv4()}`,
        text: 'You ended the conversation',
        sender: 'status',
        createdAt: new Date(),
        type: 'status',
        status: 'sent'
      };
      
      setMessages(prevMessages => [...prevMessages, statusMessage as Message]);
      
      // Only publish to channel if we have a valid channel name and realtime is enabled
      if (channelName && config?.realtime) {
        publishToChannel(channelName, 'event', {
          type: 'chat:ended',
          userId: sessionId,
          timestamp: new Date()
        });
      }
      
      // Dispatch event
      dispatchChatEvent('chat:ended', {
        timestamp: new Date()
      });
      
      return true;
    } catch (error) {
      console.error('Error ending chat:', error);
      toast.error('Failed to end chat. Please try again.');
      return false;
    }
  }, [setMessages, channelName, sessionId, config?.realtime]);

  return {
    messageText,
    setMessageText,
    handleSendMessage,
    handleUserTyping,
    handleFileUpload,
    handleEndChat
  };
}
