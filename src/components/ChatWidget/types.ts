export interface Message {
  id: string;
  text: string;
  sender: UserType;
  timestamp: Date;
  type?: MessageType;
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
  important?: boolean; // Field to mark important messages
  unread?: boolean;    // Field to mark unread messages
  metadata?: Record<string, any>;
}

export type MessageType = 'text' | 'file' | 'card' | 'quick_reply' | 'status';
export type UserType = 'user' | 'system' | 'status' | 'agent' | 'bot';

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
    status?: 'online' | 'offline' | 'away' | 'busy';
  };
  metadata?: any;
  sessionId?: string;
  contactIdentified?: boolean;
  unread?: boolean; // New property to track unread status
}

export interface Agent {
  id: string;
  name: string;
  avatar?: string;
  status?: 'online' | 'away' | 'offline';
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

export interface MessageReadStatus {
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp?: Date;
}
