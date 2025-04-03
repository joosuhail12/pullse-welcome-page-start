
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'system' | 'status';
  timestamp: Date;
  type?: 'text' | 'file' | 'card' | 'quick_reply' | 'status';
  fileUrl?: string;
  fileName?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  reaction?: 'thumbsUp' | 'thumbsDown' | null;
  cardData?: {
    title: string;
    description: string;
    imageUrl?: string;
    buttons?: Array<{ text: string; action: string }>;
  };
  quickReplies?: Array<{ text: string; action: string }>;
  important?: boolean; // New field to mark important messages
  unread?: boolean;    // New field to mark unread messages
}

// Standardized agent status type
export type AgentStatus = 'online' | 'offline' | 'away' | 'busy';

export interface Conversation {
  id: string;
  title: string;
  messages?: Message[];
  timestamp: Date;
  lastMessage?: string;
  status?: 'active' | 'ended';
  agentInfo?: {
    name?: string;
    avatar?: string;
    status?: AgentStatus;
  };
  metadata?: any;
  sessionId?: string;
  contactIdentified?: boolean;
  unread?: boolean; // New property to track unread status
  isResolved?: boolean; // Property to track if conversation is resolved
}

export interface Agent {
  id: string;
  name: string;
  avatar?: string;
  status?: AgentStatus;
}

export interface MessageReaction {
  messageId: string;
  reaction: 'thumbsUp' | 'thumbsDown';
  userId: string;
  timestamp: Date;
}

export interface MessageSearchResult {
  messageId: string;
  matchText: string;
  timestamp: Date;
}

// Define standard message types
export type MessageType = 'text' | 'file' | 'card' | 'quick_reply' | 'status';

// Define standard user types
export type UserType = 'user' | 'system' | 'bot' | 'agent' | 'status';
