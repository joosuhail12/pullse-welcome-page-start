
import { useState, useCallback } from 'react';
import { Message } from '../types';
import { publishToChannel, getConnectionState } from '../utils/ably';
import { dispatchChatEvent } from '../utils/events';
import { ChatWidgetConfig } from '../config';
import { getChatSessionId } from '../utils/cookies';
import { 
  createUserMessage, 
  createSystemMessage, 
  sendTypingIndicator, 
  processSystemMessage 
} from '../utils/messageHandlers';
import { validateMessage, validateFile, sanitizeFileName } from '../utils/validation';
import { isRateLimited } from '../utils/security';
import { toast } from '@/components/ui/use-toast';
import { addMessageToQueue } from '../utils/offlineQueue';

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
  const [fileError, setFileError] = useState<string | null>(null);
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const MESSAGE_THROTTLE_MS = 1000; // 1 second between messages

  const handleSendMessage = useCallback(() => {
    // Validate and sanitize input
    const sanitizedText = validateMessage(messageText);
    if (!sanitizedText.trim()) return;
    
    // Rate limiting check
    if (isRateLimited()) {
      toast({
        title: "Rate limit exceeded",
        description: "Please wait before sending more messages",
        variant: "destructive"
      });
      return;
    }
    
    // Message frequency throttling
    const now = Date.now();
    if (now - lastMessageTime < MESSAGE_THROTTLE_MS) {
      toast({
        title: "Sending too fast",
        description: "Please wait a moment between messages",
        variant: "destructive"
      });
      return;
    }
    setLastMessageTime(now);
    
    // Create user message with optimistic UI update
    const userMessage = createUserMessage(sanitizedText);
    
    // Optimistic update: Add user message to messages array immediately
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setMessageText('');
    
    // Dispatch message sent event
    dispatchChatEvent('chat:messageSent', { message: userMessage }, config);
    
    if (setHasUserSentMessage) {
      setHasUserSentMessage(true);
    }
    
    // Check connection state before sending
    const connectionState = getConnectionState();
    const isConnected = connectionState === 'connected';
    
    // If realtime is enabled, publish the message to the channel
    if (config?.realtime?.enabled) {
      // Optimistically show typing indicator immediately
      if (setIsTyping) {
        setIsTyping(true);
        dispatchChatEvent('chat:typingStarted', { userId: 'agent' }, config);
      }
      
      if (isConnected) {
        // We're online - send message via realtime
        publishToChannel(chatChannelName, 'message', {
          id: userMessage.id,
          text: userMessage.text,
          sender: userMessage.sender,
          timestamp: userMessage.timestamp,
          type: userMessage.type
        }).catch(err => {
          console.error('Error sending message:', err);
          // Message failed to send - queue it for later
          addMessageToQueue(userMessage, chatChannelName);
          toast({
            title: "Message queued",
            description: "Will be sent when connection is restored",
            variant: "default"
          });
        });
        
        // Stop typing indicator when sending a message
        sendTypingIndicator(chatChannelName, sessionId, 'stop');
        dispatchChatEvent('chat:typingStopped', { userId: sessionId }, config);
      } else {
        // We're offline - queue message for later sending
        addMessageToQueue(userMessage, chatChannelName);
        toast({
          title: "Message queued",
          description: "Will be sent when connection is restored",
        });
        
        // Show optimistic UI for offline mode
        setTimeout(() => {
          if (setIsTyping) {
            setIsTyping(false);
          }
          
          const optimisticResponse = createSystemMessage(
            'Your message has been queued and will be delivered when you\'re back online.'
          );
          optimisticResponse.status = 'pending';
          
          setMessages(prev => [...prev, optimisticResponse]);
        }, 1500);
      }
    } else {
      // Non-realtime mode - simulate response
      if (setIsTyping) {
        setIsTyping(true);
        
        // Dispatch typing started event for agent
        dispatchChatEvent('chat:typingStarted', { userId: 'agent' }, config);
        
        setTimeout(() => {
          setIsTyping(false);
          
          // Dispatch typing stopped event for agent
          dispatchChatEvent('chat:typingStopped', { userId: 'agent' }, config);
          
          const systemMessage = createSystemMessage(
            'Thank you for your message. How else can I assist you today?'
          );
          
          setMessages(prev => [...prev, systemMessage]);
          
          // Dispatch message received event
          dispatchChatEvent('chat:messageReceived', { message: systemMessage }, config);
          
          // Process the system message (notification, event dispatch, etc)
          processSystemMessage(systemMessage, chatChannelName, sessionId, config);
        }, Math.floor(Math.random() * 400) + 200);
      }
    }
  }, [messageText, messages, setMessages, chatChannelName, sessionId, config, setHasUserSentMessage, setIsTyping, lastMessageTime]);

  const handleUserTyping = useCallback(() => {
    // If realtime is enabled, send typing indicator
    if (config?.realtime?.enabled) {
      const isConnected = getConnectionState() === 'connected';
      if (isConnected) {
        sendTypingIndicator(chatChannelName, sessionId, 'start');
      }
    }
    
    // Dispatch typing started event
    dispatchChatEvent('chat:typingStarted', { userId: sessionId }, config);
  }, [chatChannelName, config, sessionId]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Rate limiting check
    if (isRateLimited()) {
      toast({
        title: "Rate limit exceeded",
        description: "Please wait before uploading more files",
        variant: "destructive"
      });
      return;
    }
    
    const file = files[0];
    
    // Validate file
    if (!validateFile(file)) {
      setFileError("Invalid file. Please upload images, PDFs, or documents under 5MB.");
      return;
    }
    
    // Message frequency throttling
    const now = Date.now();
    if (now - lastMessageTime < MESSAGE_THROTTLE_MS) {
      setFileError("Please wait a moment between uploads.");
      return;
    }
    setLastMessageTime(now);
    
    // Sanitize the file name
    const sanitizedFileName = sanitizeFileName(file.name);
    
    // Optimistic UI update for file upload
    const fileMessage = createUserMessage(
      `Uploaded: ${sanitizedFileName}`, 
      'file',
      { 
        fileName: sanitizedFileName, 
        fileUrl: URL.createObjectURL(file) 
      }
    );
    
    setMessages(prevMessages => [...prevMessages, fileMessage]);
    
    // Dispatch file uploaded event
    dispatchChatEvent('message:fileUploaded', { 
      message: fileMessage,
      fileName: sanitizedFileName,
      fileSize: file.size,
      fileType: file.type
    }, config);
    
    if (setHasUserSentMessage) {
      setHasUserSentMessage(true);
    }
    
    e.target.value = '';
    
    // Check connection state
    const isConnected = getConnectionState() === 'connected';
    
    // If realtime is enabled, publish the file message to the channel
    if (config?.realtime?.enabled) {
      if (isConnected) {
        publishToChannel(chatChannelName, 'message', {
          id: fileMessage.id,
          text: fileMessage.text,
          sender: fileMessage.sender,
          timestamp: fileMessage.timestamp,
          type: fileMessage.type,
          fileName: fileMessage.fileName
        }).catch(err => {
          console.error('Error sending file message:', err);
          // Queue the message for later
          addMessageToQueue(fileMessage, chatChannelName);
          toast({
            title: "File message queued",
            description: "Will be sent when connection is restored",
          });
        });
      } else {
        // Queue the message for later when offline
        addMessageToQueue(fileMessage, chatChannelName);
        toast({
          title: "File message queued",
          description: "Will be sent when connection is restored",
        });
        
        // Show optimistic response for offline mode
        setTimeout(() => {
          const optimisticResponse = createSystemMessage(
            `Your file "${sanitizedFileName}" has been queued and will be processed when you're back online.`
          );
          optimisticResponse.status = 'pending';
          
          setMessages(prev => [...prev, optimisticResponse]);
        }, 1000);
      }
    } else {
      // Non-realtime mode - simulate response
      setTimeout(() => {
        const systemMessage = createSystemMessage(
          `I've received your file ${sanitizedFileName}. Is there anything specific you'd like me to help with regarding this file?`
        );
        
        setMessages(prev => [...prev, systemMessage]);
        
        // Dispatch message received event
        dispatchChatEvent('chat:messageReceived', { message: systemMessage }, config);
        
        // Process the system message (notification, event dispatch, etc)
        processSystemMessage(systemMessage, chatChannelName, sessionId, config);
      }, 1000);
    }
  }, [messages, setMessages, config, setHasUserSentMessage, chatChannelName, sessionId, lastMessageTime]);

  const handleEndChat = useCallback(() => {
    // Optimistically update UI with end chat status
    const statusMessage: Message = {
      id: `msg-${Date.now()}-status`,
      text: 'Chat ended',
      sender: 'status',
      timestamp: new Date(),
      type: 'status'
    };
    
    setMessages(prev => [...prev, statusMessage]);
    
    // Dispatch chat ended event
    dispatchChatEvent('chat:ended', { endedByUser: true }, config);
    
    // Also dispatch chat close event for backward compatibility
    dispatchChatEvent('chat:close', { endedByUser: true }, config);
    
    // Check connection state
    const isConnected = getConnectionState() === 'connected';
    
    // If realtime is enabled, publish the end chat event
    if (config?.realtime?.enabled) {
      if (isConnected) {
        publishToChannel(chatChannelName, 'end', {
          timestamp: new Date(),
          userId: sessionId
        }).catch(err => {
          console.error('Error sending end chat event:', err);
          // Queue end event for later
          const endEvent = {
            id: `end-${Date.now()}`,
            timestamp: new Date(),
            userId: sessionId,
            type: 'status'
          };
          addMessageToQueue(endEvent as any, chatChannelName, 'end');
        });
      } else {
        // Queue end event for later when offline
        const endEvent = {
          id: `end-${Date.now()}`,
          timestamp: new Date(),
          userId: sessionId,
          type: 'status'
        };
        addMessageToQueue(endEvent as any, chatChannelName, 'end');
      }
    }
  }, [chatChannelName, config, sessionId, setMessages]);

  return {
    messageText,
    setMessageText,
    fileError,
    handleSendMessage,
    handleUserTyping,
    handleFileUpload,
    handleEndChat
  };
}
