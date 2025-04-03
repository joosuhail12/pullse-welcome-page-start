
// Add or update this in your types.ts file

export type AgentStatus = 'online' | 'offline' | 'away' | 'busy';

export interface Agent {
  id: string;
  name: string;
  avatar?: string;
  status: AgentStatus;
}

export type UserType = 'user' | 'agent' | 'bot' | 'system' | 'status';
export type MessageType = 'text' | 'card' | 'file' | 'quick_reply' | 'status';

export interface Message {
  id: string;
  text: string;
  sender: UserType;
  type: MessageType;
  timestamp: Date;
  metadata?: Record<string, any>;
  reaction?: 'thumbsUp' | 'thumbsDown' | null;
  reactions?: string[];
  important?: boolean;
  fileUrl?: string;
  fileName?: string;
  status?: 'sent' | 'delivered' | 'read';
  cardData?: {
    title?: string;
    description?: string;
    imageUrl?: string;
    buttons?: Array<{
      text: string;
      url?: string;
      action?: string;
    }>;
  };
  quickReplies?: string[];
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage?: string;
  timestamp: Date;
  messages?: Message[];
  unread?: boolean;
  agentInfo?: {
    name: string;
    avatar?: string;
    status?: AgentStatus;
  };
  contactIdentified?: boolean;
  isResolved?: boolean;
  sessionId?: string;
  status?: 'active' | 'ended' | 'pending';
  metadata?: {
    ticketProgress?: number;
    [key: string]: any;
  };
}

export interface MessageSearchResult {
  messageId: string;
  matchIndex: number;
  matchLength: number;
}

// Event types and other configurations
export type ChatEventLevel = 'debug' | 'info' | 'warning' | 'error';
export type ChatEventSource = 'user' | 'system' | 'ably' | 'internal';
