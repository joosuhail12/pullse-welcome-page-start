import { Message } from '../types';
import { ChatWidgetConfig } from '../config';
import DOMPurify from 'dompurify';
import { v4 as uuidv4 } from 'uuid';

// Array of possible response messages for the simulated agent
const RESPONSE_MESSAGES = [
  "I'm happy to help with that. Let me know if you have any other questions.",
  "Thanks for reaching out. Is there anything else you'd like to know?",
  "I've got that information for you. Can I help with anything else?",
  "That's a good question. Here's what I can tell you...",
  "I understand what you're asking. Let me address that for you.",
  "Great question! Here's what you need to know.",
  "I'm here to help with questions like that. Let me explain.",
  "I appreciate your patience. Here's the information you requested.",
  "Let me look into that for you. I'll get back to you shortly.",
  "Thank you for your question. I'm happy to provide some clarity on this topic."
];

// Array of conversational openers
const CONVERSATION_OPENERS = [
  "How can I assist you today?",
  "What brings you here today?",
  "How may I help you?",
  "What questions do you have?",
  "I'm here to help. What do you need?",
  "What can I help you find today?",
  "How can I make your day better?",
  "What information are you looking for?",
  "How can I be of assistance?",
  "What would you like to know?"
];

/**
 * Simulate agent typing behavior
 * @param setIsTyping Function to update typing state
 * @param setMessages Function to update messages
 * @param currentMessages Current messages array
 * @param config Widget configuration
 */
export function simulateAgentTyping(
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  currentMessages: Message[],
  config?: ChatWidgetConfig
): void {
  // Determine typing duration based on message length
  const typingDuration = Math.floor(Math.random() * 2000) + 1000;
  
  // Start typing
  setIsTyping(true);
  
  // After typing duration, add agent message
  setTimeout(() => {
    setIsTyping(false);
    
    // Choose a response based on conversation state
    let responseText: string;
    if (currentMessages.length === 0) {
      // If no messages, use an opener
      const randomIndex = Math.floor(Math.random() * CONVERSATION_OPENERS.length);
      responseText = CONVERSATION_OPENERS[randomIndex];
    } else {
      // Otherwise use a regular response
      const randomIndex = Math.floor(Math.random() * RESPONSE_MESSAGES.length);
      responseText = RESPONSE_MESSAGES[randomIndex];
    }
    
    // Sanitize the response text
    const sanitizedText = DOMPurify.sanitize(responseText);
    
    // Create the agent message
    const now = new Date();
    const agentMessage: Message = {
      id: `msg-${now.getTime()}-system-${uuidv4().slice(0, 8)}`,
      text: sanitizedText,
      sender: 'system',
      createdAt: now,
      timestamp: now,
      type: 'text',
      status: 'sent'
    };
    
    // Add the message to the conversation
    setMessages(prevMessages => [...prevMessages, agentMessage]);
  }, typingDuration);
}
