
import { useState, useCallback, useEffect } from 'react';
import { Message, Ticket } from '../types';
import { createUserMessage, createSystemMessage, sendTypingIndicator, createMessage } from '../utils/messageHandlers';
import { publishToChannel } from '../utils/ably';
import { dispatchChatEvent, subscribeToChatEvent } from '../utils/events';
import { ChatEventPayload, ChatWidgetConfig } from '../config';

export function useMessageActions(
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  chatChannelName: string,
  handleSelectTicket: (ticket: Ticket) => void,
  sessionId: string,
  config?: ChatWidgetConfig,
  setHasUserSentMessage?: React.Dispatch<React.SetStateAction<boolean>>,
  setIsTyping?: React.Dispatch<React.SetStateAction<boolean>>
) {
  const [messageText, setMessageText] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Move the event subscription into a useEffect to prevent infinite loop
  if (chatChannelName.includes('contactevent')) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      console.log('Setting up chat:new_ticket event listener');

      // Create subscription to chat:new_ticket event
      const unsubscribe = subscribeToChatEvent('chat:new_ticket', (event: ChatEventPayload) => {
        console.log('New ticket event received with data:', event);

        const ticketId = event.data.message;
        handleSelectTicket({
          id: ticketId,
          title: '',
          createdAt: '',
          updatedAt: ''
        });
        console.log('Before navigation attempt - current view state may be overriding');

      });

      // Return cleanup function to remove the event listener when component unmounts
      return () => {
        console.log('Cleaning up chat:new_ticket event listener');
        unsubscribe();
      };
    }, []); // Only re-subscribe if these functions change
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      console.log('Setting up chat:ticket_message event listener');

      // Create subscription to chat:new_ticket event
      const unsubscribe = subscribeToChatEvent('chat:ticket_message', (event: ChatEventPayload) => {
        console.log('New ticket message received with data:', event);
        const message = createMessage(event.data.id, event.data.text, event.data.senderType, event.data.messageType, event.data.messageConfig, event.data.messageType);
        setMessages(prevMessages => [...prevMessages, message]);
      });

      // Return cleanup function to remove the event listener when component unmounts
      return () => {
        console.log('Cleaning up chat:ticket_message event listener');
        unsubscribe();
      };
    }, []); // Only re-subscribe if these functions change
  }


  // Handle sending messages
  const handleSendMessage = useCallback(async (text?: string, messageId: string | null = null) => {
    console.log('handleSendMessage', text, messageId);
    const messageContent = text || messageText;
    if (!messageContent?.trim()) return;

    // Create a new user message
    const userMessage = createUserMessage(messageContent, 'text', {}, messageId);

    // Add message to state
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setMessageText('');

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
    if (isNewConversation) {
      publishToChannel(chatChannelName, 'new_ticket', {
        id: messageId,
        text: userMessage.text,
        sender: userMessage.sender,
      });
    } else {
      publishToChannel(chatChannelName, 'message', {
        text: userMessage.text,
        id: messageId,
        sessionId,
        ticketId: chatChannelName.split("ticket-")[1]
      });
    }

    // Dispatch event for the message
    dispatchChatEvent('chat:messageSent', { message: userMessage }, config);

    // If this channel is for contact events, show a response message
    // if (isNewConversation) {
    //   setTimeout(() => {
    //     const autoResponseMessage = createSystemMessage(
    //       'Thanks for your message! Our team will get back to you shortly.',
    //       'text'
    //     );

    //     setMessages(prevMessages => [...prevMessages, autoResponseMessage]);
    //   }, 1000);
    // }
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
      await handleSendMessage(fileMessage);
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
