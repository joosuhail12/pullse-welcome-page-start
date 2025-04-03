
// Update useMessageActions to support offline mode
import { useState, useCallback } from 'react';
import { Message } from '../types';
import { publishToChannel } from '../utils/ably';
import { createUserMessage } from '../utils/messageHandlers';
import { ConnectionStatus } from '../utils/reconnectionManager';
import { v4 as uuidv4 } from 'uuid';

interface UseMessageActionsProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  channelName: string;
  sessionId: string;
  config?: any;
  setHasUserSentMessage?: React.Dispatch<React.SetStateAction<boolean>>;
  setIsTyping?: React.Dispatch<React.SetStateAction<boolean>>;
  connectionStatus?: ConnectionStatus;
  queueMessageForSending?: (message: Message) => void;
}

export function useMessageActions({
  messages,
  setMessages,
  channelName,
  sessionId,
  config,
  setHasUserSentMessage,
  setIsTyping,
  connectionStatus = ConnectionStatus.CONNECTED,
  queueMessageForSending
}: UseMessageActionsProps) {
  const [messageText, setMessageText] = useState('');
  const [messageIdCounter, setMessageIdCounter] = useState(0);
  
  // Handle sending a message
  const handleSendMessage = useCallback(() => {
    if (!messageText.trim()) return;

    const trimmedText = messageText.trim();
    
    // Create the message object
    const newMessageId = `msg-${Date.now()}-user-${messageIdCounter}`;
    const message = createUserMessage(trimmedText);
    message.id = newMessageId;
    
    // Add message to state immediately for UI feedback
    setMessages(prevMessages => [...prevMessages, message]);

    // Clear the input
    setMessageText('');
    setMessageIdCounter(prev => prev + 1);
    
    // Update message sent flag
    if (setHasUserSentMessage) {
      setHasUserSentMessage(true);
    }
    
    // Set typing state
    if (setIsTyping) {
      setIsTyping(true);
      
      // Auto-clear typing after 10 seconds
      setTimeout(() => {
        setIsTyping(false);
      }, 10000);
    }

    // Send to server if online, otherwise queue for later
    if (connectionStatus === ConnectionStatus.CONNECTED) {
      publishToChannel(channelName, 'message', message);
    } else if (queueMessageForSending) {
      queueMessageForSending(message);
    }
    
  }, [
    messageText, 
    messageIdCounter, 
    setMessages, 
    setMessageText, 
    channelName, 
    setHasUserSentMessage, 
    setIsTyping, 
    connectionStatus, 
    queueMessageForSending
  ]);
  
  // Handle user typing
  const handleUserTyping = useCallback(() => {
    if (connectionStatus === ConnectionStatus.CONNECTED) {
      publishToChannel(channelName, 'typing', {
        status: 'start',
        userId: sessionId
      });
    }
  }, [channelName, sessionId, connectionStatus]);
  
  // Handle file upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Simple file validation
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit');
      return;
    }
    
    // In a real app, you would upload the file to a server and get a URL back
    // For now, we'll just create a placeholder message
    const fileUrl = URL.createObjectURL(file); // This is temporary and will be revoked when the page is unloaded
    
    const newMessage = createUserMessage(`File: ${file.name}`, 'file', {
      fileName: file.name,
      fileUrl
    });
    
    // Add message to state
    setMessages(prevMessages => [...prevMessages, newMessage]);
    
    // Publish message if online, otherwise queue
    if (connectionStatus === ConnectionStatus.CONNECTED) {
      publishToChannel(channelName, 'message', newMessage);
    } else if (queueMessageForSending) {
      queueMessageForSending(newMessage);
    }
    
    // Reset the file input
    e.target.value = '';
    
    // Update message sent flag
    if (setHasUserSentMessage) {
      setHasUserSentMessage(true);
    }
    
  }, [setMessages, channelName, setHasUserSentMessage, connectionStatus, queueMessageForSending]);
  
  // Handle ending the chat
  const handleEndChat = useCallback(() => {
    // Send end chat message
    const endMessage = {
      id: `status-${Date.now()}`,
      sender: 'system',
      text: 'Chat ended by user',
      timestamp: new Date(),
      type: 'status',
      status: 'sent'
    } as Message;
    
    setMessages(prevMessages => [...prevMessages, endMessage]);
    
    // Publish end chat event if online
    if (connectionStatus === ConnectionStatus.CONNECTED) {
      publishToChannel(channelName, 'end', {
        userId: sessionId,
        timestamp: new Date()
      });
    }
    
  }, [setMessages, channelName, sessionId, connectionStatus]);
  
  return {
    messageText,
    setMessageText,
    handleSendMessage,
    handleUserTyping,
    handleFileUpload,
    handleEndChat
  };
}
