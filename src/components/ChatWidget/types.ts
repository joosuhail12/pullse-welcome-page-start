
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'system' | 'status';
  timestamp: Date;
  type?: 'text' | 'file' | 'card' | 'quick_reply' | 'status';
  fileUrl?: string;
  fileName?: string;
  status?: 'sent' | 'delivered' | 'read';
  reaction?: 'thumbsUp' | 'thumbsDown' | null;
  cardData?: {
    title: string;
    description: string;
    imageUrl?: string;
    buttons?: Array<{ text: string; action: string }>;
  };
  quickReplies?: Array<{ text: string; action: string }>;
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  agentInfo?: {
    name: string;
    avatar?: string;
  };
  messages?: Message[];
  sessionId?: string;
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
