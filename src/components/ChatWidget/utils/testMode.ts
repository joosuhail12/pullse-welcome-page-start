
/**
 * Test Mode Utilities
 * 
 * This module provides functionality for test mode in the chat widget,
 * allowing customers to preview the widget with sample data.
 */

// Flag to track if test mode is enabled
let testModeEnabled = false;

// Set test mode state
export function setTestMode(enabled: boolean): void {
  testModeEnabled = enabled;
  
  // Store in sessionStorage so it persists during page refreshes in the same session
  if (enabled) {
    try {
      sessionStorage.setItem('pullse_test_mode', 'enabled');
    } catch (e) {
      console.warn('Failed to store test mode setting in sessionStorage');
    }
  } else {
    try {
      sessionStorage.removeItem('pullse_test_mode');
    } catch (e) {
      // Ignore errors
    }
  }
}

// Check if test mode is enabled
export function isTestMode(): boolean {
  if (testModeEnabled) return true;
  
  // Check sessionStorage as fallback
  try {
    return sessionStorage.getItem('pullse_test_mode') === 'enabled';
  } catch (e) {
    return false;
  }
}

// Get sample messages for test mode
export function getSampleMessages() {
  return [
    {
      id: 'test-msg-1',
      text: 'Hello! How can I help you today?',
      sender: 'agent',
      timestamp: new Date(Date.now() - 300000),
      status: 'delivered',
      agentId: 'test-agent'
    },
    {
      id: 'test-msg-2',
      text: 'I have a question about your services.',
      sender: 'user',
      timestamp: new Date(Date.now() - 240000),
      status: 'delivered'
    },
    {
      id: 'test-msg-3',
      text: 'Of course! I\'d be happy to help with any questions about our services. What specifically would you like to know?',
      sender: 'agent',
      timestamp: new Date(Date.now() - 180000),
      status: 'delivered',
      agentId: 'test-agent'
    }
  ];
}

// Get sample conversations for test mode
export function getSampleConversations() {
  return [
    {
      id: 'test-convo-1',
      title: 'Support Inquiry',
      preview: 'I have a question about your services',
      timestamp: new Date(Date.now() - 86400000),
      unreadCount: 0,
      status: 'active',
      messages: getSampleMessages(),
      agentInfo: {
        id: 'test-agent',
        name: 'Test Agent',
        avatar: null,
        status: 'online'
      }
    },
    {
      id: 'test-convo-2',
      title: 'Billing Question',
      preview: 'Can you help with my invoice?',
      timestamp: new Date(Date.now() - 172800000),
      unreadCount: 0,
      status: 'closed',
      messages: [],
      agentInfo: {
        id: 'test-agent-2',
        name: 'Billing Support',
        avatar: null,
        status: 'offline'
      }
    }
  ];
}

// Simulate typing delay for test mode
export function simulateAgentTypingInTestMode(callback: () => void): { cancel: () => void } {
  const timer = setTimeout(() => {
    callback();
  }, 2000 + Math.random() * 1000);
  
  return {
    cancel: () => clearTimeout(timer)
  };
}

// Simulate agent response in test mode
export function simulateAgentResponseInTestMode(text: string): { id: string; text: string; sender: string; timestamp: Date; status: string; agentId: string } {
  return {
    id: 'test-response-' + Date.now(),
    text,
    sender: 'agent',
    timestamp: new Date(),
    status: 'delivered',
    agentId: 'test-agent'
  };
}
