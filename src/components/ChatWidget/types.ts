
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'system' | 'status' | 'agent' | 'bot';
  timestamp: Date;
  type?: MessageType;
  fileUrl?: string;
  fileName?: string;
  status?: MessageReadStatus;
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
  systemMessage?: boolean; // Added for system messages
  fileInfo?: {         // Added for file messages
    name: string;
    size: number;
    type: string;
    url: string;
  };
  metadata?: Record<string, any>; // Added for additional data
}

export type MessageType = 'text' | 'file' | 'card' | 'quick_reply' | 'status';
export type UserType = 'user' | 'system' | 'bot' | 'agent' | 'status';
export type MessageReadStatus = 'sent' | 'delivered' | 'read';

export interface Conversation {
  id: string;
  title: string;
  messages?: Message[];
  timestamp: Date;
  lastMessage?: string;
  status: 'active' | 'ended' | string;
  agentInfo?: {
    id?: string;
    name?: string;
    avatar?: string;
    status?: 'online' | 'offline' | 'away' | 'busy';
  };
  metadata?: any;
  sessionId?: string;
  contactIdentified?: boolean;
  unread?: boolean; // New property to track unread status
  unreadCount?: number; // New property to track unread count
  preview?: string; // Preview of the last message
  isResolved?: boolean; // Added for resolved status
}

export interface Agent {
  id: string;
  name: string;
  avatar?: string;
  status?: 'online' | 'away' | 'offline' | 'busy';
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

export interface PreChatForm {
  enabled: boolean;
  title: string;
  description?: string; // Added missing field
  fields: PreChatFormField[];
  submitButtonText?: string; // Added missing field
}

export interface PreChatFormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'select' | 'textarea';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

// Export this explicitly to make TypeScript happy with imports
export { MessageReadStatus } from './components/MessageReadReceipt';
