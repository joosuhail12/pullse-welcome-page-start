export type MessageReadStatus = 'sent' | 'delivered' | 'read';

export interface MessageReadReceipt {
  status: MessageReadStatus;
  timestamp: Date;
}

export interface UserFormData {
  name: string;
  email: string;
}

export interface MessageSearchResult {
  messageId: string;
  text: string;
  matches: { start: number; end: number }[];
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'system' | 'agent' | 'status';
  timestamp: Date;
  createdAt: Date;
  type: 'text' | 'file' | 'image' | 'card' | 'quickReply' | 'status';
  status?: MessageReadStatus;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  reaction?: 'thumbsUp' | 'thumbsDown';
  cards?: any[];
  quickReplies?: any[];
  imageUrl?: string;
  agentId?: string;
  agentName?: string;
  agentAvatar?: string;
}
