
/**
 * Common type definitions for the Chat Widget
 */

export type MessageSender = 'user' | 'bot' | 'agent' | 'system' | 'status';

export type MessageType = 'text' | 'image' | 'file' | 'card' | 'quick_reply' | 'status';

export type MessageReadStatus = 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  text: string;
  sender: MessageSender;
  timestamp: Date;
  type?: MessageType;
  metadata?: Record<string, any>;
  reactions?: string[];
  status?: MessageReadStatus;
  fileName?: string;
  cardData?: {
    title: string;
    description: string;
    imageUrl?: string;
    buttons?: Array<{ text: string; action: string }>;
  };
  quickReplies?: Array<{ text: string; action?: string }>;
  reaction?: 'thumbsUp' | 'thumbsDown'; // For backwards compatibility
  important?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  status: 'active' | 'closed' | 'archived' | 'ended';
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  participants?: { id: string; name: string; avatar?: string; metadata?: Record<string, any> }[];
  metadata?: Record<string, any>;
  lastMessage?: string;
  timestamp?: Date;
  unread?: boolean;
  sessionId?: string;
  agentInfo?: {
    name: string;
    avatar?: string;
    status?: 'online' | 'offline' | 'away' | 'busy';
  };
  contactIdentified?: boolean;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  metadata?: Record<string, any>;
}

export interface Agent {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  role?: string;
  metadata?: Record<string, any>;
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  metadata?: Record<string, any>;
}

export interface MessageSearchResult {
  messageId: string;
  conversationId: string;
  score: number;
  highlight?: string[];
}
