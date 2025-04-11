export type ChatEventType = 
  | 'chat:open'
  | 'chat:close'
  | 'chat:minimize'
  | 'chat:maximize'
  | 'chat:messageSent'
  | 'chat:messageReceived'
  | 'chat:typingStarted'
  | 'chat:typingStopped'
  | 'message:reacted'
  | 'message:fileUploaded'
  | 'contact:initiated'
  | 'contact:formCompleted'
  | 'notification:read'
  | 'notification:clicked'
  | 'widget:loaded'
  | 'widget:error'
  | `local:${string}:${string}`;

export interface Ticket {
  id: string;
  sno: number;
  title: string;
  description: string | null;
  status: string;
  unread: number;
  lastMessage: string;
  lastMessageAt: string;
  lastMessageBy: string | null;
  createdAt: string;
  updatedAt: string;
  deviceId: string | null;
  assigneeId: string | null;
}

export interface MessageReadReceipt {
  status: MessageReadStatus;
  timestamp?: Date;
}

export interface Message {
  id: string;
  text: string;
  sender: UserType;
  timestamp: Date;
  createdAt: Date;
  type?: MessageType;
  status?: MessageStatus;
  metadata?: Record<string, any>;
  fileName?: string;
  fileUrl?: string;
  reaction?: 'thumbsUp' | 'thumbsDown' | null;
  important?: boolean;
}

export interface MessageSearchResult {
  id: string;
  index: number;
}

export interface FormDataStructure {
  contact?: Array<{
    entityname: string;
    columnname: string;
    value: string;
    type: string;
    label: string;
    required: boolean;
    placeholder?: string;
  }>;
  company?: Array<{
    entityname: string;
    columnname: string;
    value: string;
    type: string;
    label: string;
    required: boolean;
    placeholder?: string;
  }>;
  customData?: Array<{
    entityname: string;
    columnname: string;
    value: string;
    type: string;
    label: string;
    required: boolean;
    placeholder?: string;
  }>;
}

export type MessageType = 'text' | 'file' | 'card' | 'quick_reply' | 'status';
export type UserType = 'user' | 'agent' | 'system' | 'bot' | 'status';
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
export type AgentStatus = 'online' | 'offline' | 'away' | 'busy';
export type MessageReadStatus = 'sent' | 'delivered' | 'read';

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  createdAt: Date;
  messages: Message[];
  agentInfo?: {
    name: string;
    avatar?: string;
    status?: AgentStatus;
  };
  unread?: boolean;
  contactIdentified?: boolean;
  sessionId?: string;
  ticketId?: string;
  metadata?: Record<string, any>;
}
