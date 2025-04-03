
import { v4 as uuidv4 } from 'uuid';
import { Message, Conversation } from '../types';

/**
 * Check if test mode is enabled
 * @returns True if test mode is enabled
 */
export function isTestMode(): boolean {
  try {
    return sessionStorage.getItem('pullse_test_mode') === 'enabled';
  } catch (e) {
    // If sessionStorage is not available, fallback to false
    return false;
  }
}

/**
 * Enable or disable test mode
 * @param enabled Whether to enable or disable test mode
 */
export function setTestMode(enabled: boolean): void {
  try {
    if (enabled) {
      sessionStorage.setItem('pullse_test_mode', 'enabled');
      console.info('[TEST MODE] Test mode enabled');
    } else {
      sessionStorage.removeItem('pullse_test_mode');
      console.info('[TEST MODE] Test mode disabled');
    }
  } catch (e) {
    console.warn('[TEST MODE] Could not access sessionStorage to set test mode', e);
  }
}

/**
 * Get sample test data for conversations
 * @returns Array of sample conversations
 */
export function getSampleConversations(): Conversation[] {
  return [
    {
      id: '1',
      title: 'Test Conversation 1',
      timestamp: new Date(),
      status: 'active',
      preview: 'This is a test conversation',
      unreadCount: 2,
      messages: [
        {
          id: `msg-${Date.now()}-1`,
          text: 'Hello! How can I help you today?',
          sender: 'system',
          timestamp: new Date(Date.now() - 3600000),
          status: 'read'
        },
        {
          id: `msg-${Date.now()}-2`,
          text: 'I have a question about your services.',
          sender: 'user',
          timestamp: new Date(Date.now() - 3500000),
          status: 'read'
        },
        {
          id: `msg-${Date.now()}-3`,
          text: 'Of course! I\'d be happy to help with that. What would you like to know?',
          sender: 'system',
          timestamp: new Date(Date.now() - 3400000),
          status: 'sent'
        }
      ],
      agentInfo: {
        id: 'agent-1',
        name: 'Test Agent',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test-agent',
        status: 'online'
      }
    },
    {
      id: '2',
      title: 'Test Conversation 2',
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      status: 'ended',
      preview: 'Thank you for your help',
      unreadCount: 0,
      messages: [
        {
          id: `msg-${Date.now()}-4`,
          text: 'Hi there! What can I do for you?',
          sender: 'system',
          timestamp: new Date(Date.now() - 90000000),
          status: 'read'
        },
        {
          id: `msg-${Date.now()}-5`,
          text: 'I need technical support.',
          sender: 'user',
          timestamp: new Date(Date.now() - 89900000),
          status: 'read'
        },
        {
          id: `msg-${Date.now()}-6`,
          text: 'I\'ll connect you with our technical team.',
          sender: 'system',
          timestamp: new Date(Date.now() - 89800000),
          status: 'read'
        },
        {
          id: `msg-${Date.now()}-7`,
          text: 'Thank you for your help.',
          sender: 'user',
          timestamp: new Date(Date.now() - 89700000),
          status: 'read'
        }
      ],
      agentInfo: {
        id: 'agent-2',
        name: 'Support Team',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=support-team',
        status: 'offline'
      }
    }
  ];
}

/**
 * Get a test message response based on user input
 * @param userMessage The user's message
 * @returns A generated test response message
 */
export function getTestResponse(userMessage: string): Message {
  const responses = [
    "This is a test response from the system. In test mode, all responses are simulated.",
    "I'm a test bot. Your real messages will be sent to actual agents in production.",
    "Test mode enabled. This message is automatically generated.",
    "Your message has been received in test mode. No actual processing is happening.",
    "In production, this would be handled by a real agent or AI system."
  ];
  
  // Pick a random response
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  return {
    id: uuidv4(),
    text: randomResponse,
    sender: 'system',
    timestamp: new Date(),
    type: 'text',
    status: 'sent'
  };
}

/**
 * Generate a test system message
 * @param text Message text
 * @returns A system message
 */
export function createTestSystemMessage(text: string): Message {
  return {
    id: uuidv4(),
    text,
    sender: 'system',
    timestamp: new Date(),
    type: 'text',
    status: 'sent'
  };
}

/**
 * Create a test tag for UI components in test mode
 * @returns A React element for the test tag or null
 */
export function createTestBadge(): JSX.Element | null {
  if (!isTestMode()) return null;
  
  return (
    <div className="absolute top-1 right-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
      TEST
    </div>
  );
}
