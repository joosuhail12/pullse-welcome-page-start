export interface Message {
  id: string;
  text: string;
  sender: UserType;
  role?: 'user' | 'system' | 'bot' | 'agent' | 'status';
  timestamp: Date;
  type?: MessageType;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mediaUrl?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  reaction?: 'thumbsUp' | 'thumbsDown' | null;
  cardData?: {
    title: string;
    description: string;
    imageUrl?: string;
    buttons?: Array<{ text: string; action: string }>;
  };
  quickReplies?: Array<{ text: string; action: string }>;
  important?: boolean;
  unread?: boolean;
  metadata?: Record<string, any>;
}

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
  unread?: boolean;
  isResolved?: boolean;
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

export type MessageType = 'text' | 'file' | 'card' | 'quick_reply' | 'status' | 'image';

export type UserType = 'user' | 'system' | 'bot' | 'agent' | 'status';

export type MessageReadStatus = 'unread' | 'delivered' | 'read';

export interface MessageReadReceipt {
  status: MessageReadStatus;
  timestamp?: Date;
}

export interface MessageReactionButtonsProps {
  onReact: (emoji: string) => void;
  onClose: () => void;
}

export interface MessageAvatarProps {
  isUserMessage: boolean;
  userAvatar: string;
  agentAvatar: string;
  agentStatus?: AgentStatus;
}

export interface MessageBubbleProps {
  message: Message;
  highlightText?: string;
  isHighlighted?: boolean;
  userAvatar: string;
  agentAvatar: string;
  onReply: (text: string) => void;
  onReaction: (messageId: string, emoji: string) => void;
  agentStatus?: AgentStatus;
  readStatus?: MessageReadStatus;
  readTimestamp?: Date;
  searchTerm?: string;
  onToggleHighlight?: () => void;
}

export interface QuickReplyMessageProps {
  metadata: Record<string, any>;
  onReply: (text: string) => void;
}

export type ChatPosition = 
  | 'bottom-right' 
  | 'bottom-left' 
  | 'top-right' 
  | 'top-left'
  | {
      placement: string;
      offsetX: number;
      offsetY: number;
    };
