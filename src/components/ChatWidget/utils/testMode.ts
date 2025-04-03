
import { v4 as uuidv4 } from 'uuid';
import { Conversation, Message } from '../types';

// Store the test mode flag
let testModeEnabled = false;

// Check if test mode is enabled
export const isTestMode = (): boolean => {
  // Check session storage first
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const storedValue = sessionStorage.getItem('pullse_test_mode');
      if (storedValue === 'enabled') {
        return true;
      }
    }
  } catch (e) {
    // Ignore storage errors
  }
  
  // Fall back to our in-memory flag
  return testModeEnabled;
};

// Set test mode status
export const setTestMode = (enabled: boolean): void => {
  testModeEnabled = enabled;
  
  // Also store in session storage for persistence
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      if (enabled) {
        sessionStorage.setItem('pullse_test_mode', 'enabled');
      } else {
        sessionStorage.removeItem('pullse_test_mode');
      }
    }
  } catch (e) {
    // Ignore storage errors
  }
};

// Generate sample conversations for test mode
export const getSampleConversations = (): Conversation[] => {
  return [
    {
      id: 'test-conversation-1',
      title: 'Test Conversation 1',
      preview: 'This is a test conversation',
      timestamp: new Date(),
      unreadCount: 2,
      status: 'active',
      messages: [
        {
          id: uuidv4(),
          text: 'Hello! How can I help you today?',
          sender: 'agent',
          timestamp: new Date(Date.now() - 60000),
          status: 'delivered'
        },
        {
          id: uuidv4(),
          text: 'I need help with my account',
          sender: 'user',
          timestamp: new Date(Date.now() - 30000),
          status: 'delivered'
        }
      ],
      agentInfo: {
        name: 'Test Agent',
        avatar: null,
        status: 'online'
      }
    }
  ];
};

// Simulate typing indicator in test mode
export const simulateAgentTypingInTestMode = (
  callback: () => void
): { cancel: () => void } => {
  // Random typing time between 1.5 and 4 seconds
  const typingTime = Math.floor(Math.random() * 2500) + 1500;
  
  // Set timeout
  const timeoutId = setTimeout(() => {
    callback();
  }, typingTime);
  
  // Return object with cancel function
  return {
    cancel: () => clearTimeout(timeoutId)
  };
};

// Simulate agent response in test mode
export const simulateAgentResponseInTestMode = (
  text: string
): Message => {
  return {
    id: uuidv4(),
    text,
    sender: 'agent',
    timestamp: new Date(),
    status: 'delivered'
  };
};

// Create a test conversation
export const createTestConversation = (
  title = 'New Test Conversation'
): Conversation => {
  return {
    id: `test-conversation-${Date.now()}`,
    title,
    timestamp: new Date(),
    status: 'active',
    messages: [],
    agentInfo: {
      name: 'Test Agent',
      avatar: null,
      status: 'online'
    }
  };
};
