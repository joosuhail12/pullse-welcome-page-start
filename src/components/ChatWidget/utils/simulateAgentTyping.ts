
import { v4 as uuidv4 } from 'uuid';
import { Message } from '../types';
import { ChatWidgetConfig } from '../config';
import { dispatchChatEvent } from './events';

/**
 * AI simulated responses for non-realtime mode
 */
const simulatedResponses = [
  "Thank you for your message. An agent will respond shortly.",
  "We've received your inquiry and will get back to you soon.",
  "Thanks for reaching out! Our team is reviewing your message.",
  "Your message has been received. We'll respond as soon as possible.",
  "Thank you for contacting us. An agent will assist you shortly."
];

/**
 * Get a random duration between min and max
 */
function getRandomDuration(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Get a random response from the simulated responses
 */
function getRandomResponse(): string {
  const index = Math.floor(Math.random() * simulatedResponses.length);
  return simulatedResponses[index];
}

/**
 * Simulate agent typing and response in non-realtime mode
 * Returns a timeout ID that can be used to clear the timeout
 */
export function simulateAgentTyping(
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  config?: ChatWidgetConfig,
  playMessageSound?: () => void
): ReturnType<typeof setTimeout> {
  // Don't simulate if disabled
  if (config?.realtime) {
    return setTimeout(() => {}, 0);
  }

  // Start typing indicator
  setIsTyping(true);
  
  // Dispatch typing started event
  dispatchChatEvent('agent:typing', { status: 'typing' });

  // Typing duration between 2-5 seconds
  const typingDuration = getRandomDuration(2000, 5000);
  
  // Create timeout for stopping typing and sending message
  const timeout = setTimeout(() => {
    // Stop typing indicator
    setIsTyping(false);
    
    // Dispatch typing stopped event
    dispatchChatEvent('agent:typing', { status: 'idle' });
    
    // Add simulated agent message
    const message: Message = {
      id: `sim-${uuidv4()}`,
      text: getRandomResponse(),
      sender: 'system',
      createdAt: new Date(),
      type: 'text',
      status: 'sent'
    };
    
    setMessages(prev => [...prev, message]);
    
    // Play sound if provided
    if (playMessageSound) {
      playMessageSound();
    }
    
    // Dispatch message received event
    dispatchChatEvent('message:received', {
      messageId: message.id,
      text: message.text,
      timestamp: message.createdAt
    });
  }, typingDuration);
  
  return timeout;
}
