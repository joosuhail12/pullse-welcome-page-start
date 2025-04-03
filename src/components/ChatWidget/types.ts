
/**
 * Common type definitions for the Chat Widget
 */

export type MessageSender = 'user' | 'bot' | 'agent' | 'system';

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
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  status: 'active' | 'closed' | 'archived';
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  participants?: { id: string; name: string; avatar?: string }[];
  metadata?: Record<string, any>;
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
