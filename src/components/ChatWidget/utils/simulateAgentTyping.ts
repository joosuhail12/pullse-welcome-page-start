
import { Message } from '../types';
import { ChatWidgetConfig } from '../config';
import { createSystemMessage, getRandomResponse } from './messageHandlers';
import { dispatchChatEvent } from './events';

/**
 * Simulates agent typing and response for non-realtime mode
 */
export const simulateAgentTyping = (
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  config?: ChatWidgetConfig,
  playMessageSound?: () => void
): NodeJS.Timeout => {
  const randomTimeout = Math.floor(Math.random() * 10000) + 5000;
  
  const typingTimer = setTimeout(() => {
    setIsTyping(true);
    
    const typingDuration = Math.floor(Math.random() * 2000) + 1000;
    setTimeout(() => {
      setIsTyping(false);
      
      const responseDelay = Math.floor(Math.random() * 400) + 200;
      setTimeout(() => {
        const randomResponse = getRandomResponse();
        const systemMessage = createSystemMessage(randomResponse);
        
        setMessages(prev => [...prev, systemMessage]);
        
        // Process the system message (event dispatch, etc)
        if (playMessageSound) {
          playMessageSound();
        }
        dispatchChatEvent('chat:messageReceived', { message: systemMessage }, config);
      }, responseDelay);
    }, typingDuration);
  }, randomTimeout);
  
  return typingTimer;
};
