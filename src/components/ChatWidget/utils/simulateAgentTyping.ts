
import { v4 as uuidv4 } from 'uuid';
import { Message } from '../types';
import { ChatWidgetConfig } from '../config';

/**
 * Simulate agent typing behavior
 * @param setIsTyping Function to set typing state
 * @param setMessages Function to update messages
 * @param config Chat widget configuration
 * @param playMessageSound Function to play message sound
 * @returns Timeout ID
 */
export const simulateAgentTyping = (
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  config?: ChatWidgetConfig,
  playMessageSound?: () => void
): ReturnType<typeof setTimeout> => {
  // Start typing
  setIsTyping(true);

  // Determine message delay based on complexity
  const typingDelay = Math.floor(Math.random() * 3000) + 1000; // 1-4 seconds

  // After delay, send a response
  return setTimeout(() => {
    // Stop typing
    setIsTyping(false);

    // Get simulated agent response
    const response = getAgentResponse(config);

    // Add message to the list
    setMessages(prev => [...prev, response]);

    // Play sound if available
    if (playMessageSound) {
      playMessageSound();
    }
  }, typingDelay);
};

/**
 * Get a simulated agent response
 * @param config Chat widget configuration
 * @returns Simulated message
 */
export const getAgentResponse = (config?: ChatWidgetConfig): Message => {
  // Default responses if no config
  const defaultResponses = [
    "I'm here to help! What can I do for you?",
    "How can I assist you today?",
    "Thanks for your message. How can I help?",
    "I'd be happy to help with that. Could you provide more details?"
  ];

  // Select a random response
  const responses = config?.labels.welcomeTitle
    ? [config.labels.welcomeTitle, ...defaultResponses]
    : defaultResponses;

  const randomResponse = responses[Math.floor(Math.random() * responses.length)];

  return {
    id: `msg-${uuidv4()}`,
    text: randomResponse,
    sender: 'system',
    timestamp: new Date(),
    type: 'text',
    status: 'sent'
  };
};
