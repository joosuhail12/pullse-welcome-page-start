
/**
 * Utility for test mode in the chat widget
 */
import { v4 as uuidv4 } from 'uuid';
import { Message } from '../types';

/**
 * Check if test mode is enabled
 */
export function isTestMode(): boolean {
  try {
    return sessionStorage.getItem('pullse_test_mode') === 'enabled';
  } catch (e) {
    return false;
  }
}

/**
 * Enable or disable test mode
 */
export function setTestMode(enabled: boolean): void {
  try {
    if (enabled) {
      sessionStorage.setItem('pullse_test_mode', 'enabled');
      console.info('[Pullse] Test mode enabled');
    } else {
      sessionStorage.removeItem('pullse_test_mode');
      console.info('[Pullse] Test mode disabled');
    }
  } catch (e) {
    console.warn('[Pullse] Could not access sessionStorage for test mode');
  }
}

/**
 * Simulate typing with a delay then execute callback
 */
export function simulateAgentTypingInTestMode(callback: () => void, typingDuration = 1500): { cancel: () => void } {
  let timeoutId = setTimeout(callback, typingDuration);
  let isCancelled = false;
  
  return {
    cancel: () => {
      if (!isCancelled) {
        clearTimeout(timeoutId);
        isCancelled = true;
      }
    }
  };
}

/**
 * Generate a simulated agent response message
 */
export function simulateAgentResponseInTestMode(text: string): Message {
  return {
    id: uuidv4(),
    text,
    // Using 'system' as the sender type since 'agent' is not part of the allowed values
    sender: 'system',
    timestamp: new Date(),
    status: 'delivered'
  };
}

/**
 * Get a simulated agent for test mode
 */
export function getTestAgent() {
  return {
    id: 'test-agent',
    name: 'Test Agent',
    status: 'online' as const,
    avatar: 'https://api.dicebear.com/6.x/micah/svg?seed=TestAgent'
  };
}

/**
 * Generate simulated test conversations
 */
export function generateTestConversations(count = 3): any[] {
  const conversations = [];
  const now = new Date();
  
  const templates = [
    {
      title: 'Product Information Request',
      messageCount: 4,
      firstMessage: 'Hi, I need information about your product.',
      responses: [
        'Hello! I\'d be happy to help. What would you like to know about our products?',
        'We offer different packages with various features.',
        'Is there anything specific you\'re interested in?'
      ]
    },
    {
      title: 'Technical Support Inquiry',
      messageCount: 5,
      firstMessage: 'I\'m having trouble setting up my account.',
      responses: [
        'I\'m sorry to hear that. I\'d be happy to help you with the account setup.',
        'Could you tell me what step you\'re stuck on?',
        'Have you already confirmed your email address?',
        'Let me check your account status.'
      ]
    },
    {
      title: 'Pricing Question',
      messageCount: 3,
      firstMessage: 'What are your pricing plans?',
      responses: [
        'We have several pricing plans available depending on your needs.',
        'Our basic plan starts at $9.99/month, while our premium plan is $29.99/month.'
      ]
    }
  ];
  
  for (let i = 0; i < count; i++) {
    const template = templates[i % templates.length];
    const messages: Message[] = [];
    
    // Add user's first message
    messages.push({
      id: uuidv4(),
      text: template.firstMessage,
      sender: 'user',
      timestamp: new Date(now.getTime() - (count - i) * 24 * 60 * 60 * 1000 - 30 * 60 * 1000),
      status: 'read'
    });
    
    // Add agent responses
    for (let j = 0; j < template.responses.length; j++) {
      messages.push({
        id: uuidv4(),
        text: template.responses[j],
        // Using 'system' since 'agent' is not allowed
        sender: 'system',
        timestamp: new Date(now.getTime() - (count - i) * 24 * 60 * 60 * 1000 - (30 - j * 5) * 60 * 1000),
        status: 'delivered'
      });
    }
    
    const conversation = {
      id: uuidv4(),
      title: template.title,
      preview: template.responses[template.responses.length - 1],
      timestamp: new Date(now.getTime() - (count - i) * 24 * 60 * 60 * 1000),
      unreadCount: 0,
      status: 'active',
      messages,
      agentInfo: getTestAgent()
    };
    
    conversations.push(conversation);
  }
  
  return conversations;
}
