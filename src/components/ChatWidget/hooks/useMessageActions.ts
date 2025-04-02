
import { useState, useCallback } from 'react';
import { Message } from '../types';
import { publishToChannel } from '../utils/ably';
import { dispatchChatEvent } from '../utils/events';
import { ChatWidgetConfig } from '../config';
import { getChatSessionId } from '../utils/cookies';
import { 
  createUserMessage, 
  createSystemMessage, 
  sendTypingIndicator, 
  processSystemMessage 
} from '../utils/messageHandlers';

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

  const handleSendMessage = useCallback(() => {
    if (!messageText.trim()) return;
    
    const userMessage = createUserMessage(messageText);
    
    setMessages([...messages, userMessage]);
    setMessageText('');
    
    // Dispatch message sent event
    dispatchChatEvent('chat:messageSent', { message: userMessage }, config);
    
    if (setHasUserSentMessage) {
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
      
      // Stop typing indicator when sending a message
      sendTypingIndicator(chatChannelName, sessionId, 'stop');
    } else {
      // Fallback to the original behavior
      if (setIsTyping) {
        setIsTyping(true);
        
        setTimeout(() => {
          setIsTyping(false);
          
          const systemMessage = createSystemMessage(
            'Thank you for your message. How else can I assist you today?'
          );
          
          setMessages(prev => [...prev, systemMessage]);
          
          // Process the system message (notification, event dispatch, etc)
          processSystemMessage(systemMessage, chatChannelName, sessionId, config);
        }, Math.floor(Math.random() * 400) + 200);
      }
    }
  }, [messageText, messages, setMessages, chatChannelName, sessionId, config, setHasUserSentMessage, setIsTyping]);

  const handleUserTyping = useCallback(() => {
    // If realtime is enabled, send typing indicator
    if (config?.realtime?.enabled) {
      sendTypingIndicator(chatChannelName, sessionId, 'start');
    }
  }, [chatChannelName, config?.realtime?.enabled, sessionId]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    const fileMessage = createUserMessage(
      `Uploaded: ${file.name}`, 
      'file',
      { 
        fileName: file.name, 
        fileUrl: URL.createObjectURL(file) 
      }
    );
    
    setMessages([...messages, fileMessage]);
    
    // Dispatch message sent event for file
    dispatchChatEvent('chat:messageSent', { message: fileMessage, isFile: true }, config);
    
    if (setHasUserSentMessage) {
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
      });
    } else {
      // Fallback to the original behavior
      setTimeout(() => {
        const systemMessage = createSystemMessage(
          `I've received your file ${file.name}. Is there anything specific you'd like me to help with regarding this file?`
        );
        
        setMessages(prev => [...prev, systemMessage]);
        
        // Process the system message (notification, event dispatch, etc)
        processSystemMessage(systemMessage, chatChannelName, sessionId, config);
      }, 1000);
    }
  }, [messages, setMessages, config, setHasUserSentMessage, chatChannelName, sessionId]);

  const handleEndChat = useCallback(() => {
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
  }, [chatChannelName, config, sessionId, setMessages]);

  return {
    messageText,
    setMessageText,
    handleSendMessage,
    handleUserTyping,
    handleFileUpload,
    handleEndChat
  };
}
