export interface Message {
  id: string;
  text: string;
  sender: UserType;
  messageType?: 'text' | 'data_collection' | 'action_buttons' | 'csat' | 'mention' | 'note';
  messageConfig?: Record<string, any>;
  createdAt: Date;
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
  important?: boolean; // New field to mark important messages
  unread?: boolean;    // New field to mark unread messages
  metadata?: Record<string, any>; // Add metadata field for flexibility
  timestamp?: Date;    // For backward compatibility
  senderType?: 'user' | 'agent' | 'system'; // Add senderType for compatibility
  reactions?: string[]; // Add reactions array
}

// Standardized agent status type
export type AgentStatus = 'online' | 'offline' | 'away' | 'busy';

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  status?: 'active' | 'ended' | 'closed' | 'open';
  lastMessage?: string;
  messages?: Message[];
  timestamp?: Date;
  unread?: boolean;
  ticketId?: string;
  sessionId?: string;
  agentInfo?: {
    id?: string;
    name?: string;
    avatar?: string;
    status?: AgentStatus;
    email?: string;
  };
  rating?: number;  // Add rating field to the Conversation interface
}

export interface Agent {
  id: string;
  name: string;
  avatar?: string;
  status?: AgentStatus;
}

// Define standard message types
export type MessageType = 'text' | 'file' | 'card' | 'quick_reply' | 'status' | 'data_collection';

// Define standard user types
export type UserType = 'user' | 'system' | 'bot' | 'agent' | 'status' | 'customer';

// Ticket Interface to match API response
export interface Ticket {
  id: string;
  title: string;
  description?: string;
  rating?: number;
  status?: string;
  priority?: number;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unread?: number;
  teamId?: string;
  deviceId?: string;
}

// Ticket Message Interface to match API response
export interface TicketMessage {
  id: string;
  message: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  ticketId: string;
  userType: 'customer' | 'agent';
  messageType?: 'text' | 'data_collection' | 'action_buttons' | 'csat' | 'mention' | 'note';
  senderType?: 'user' | 'agent' | 'system';
  messageConfig?: Record<string, any>;
}

// Define MessageReadStatus type 
export type MessageReadStatus = 'unread' | 'delivered' | 'read';

export interface MessageReadReceipt {
  status: MessageReadStatus;
  timestamp?: Date;
  createdAt?: Date;
}

// Define MessageReaction types
export interface MessageReactionButtonsProps {
  onReact: (emoji: string) => void;
  onClose: () => void;
}

// Define MessageAvatar props
export interface MessageAvatarProps {
  isUserMessage: boolean;
  userAvatar: string;
  agentAvatar: string;
  agentStatus?: AgentStatus;
}

// Update MessageBubbleProps with the missing properties
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
  searchTerm?: string; // Added searchTerm property
  onToggleHighlight?: () => void; // Added onToggleHighlight property
}

// Define QuickReplyMessage props
export interface QuickReplyMessageProps {
  metadata: Record<string, any>;
  onReply: (text: string) => void;
}

// Fixed ChatPosition type
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

// Added for MessageSearchResult
export interface MessageSearchResult {
  messageId: string;
  text: string;
  conversationId: string;
  score: number;
}

// Form data structure for consistency
export type FormDataStructure = Record<string, string>;

// Connection event for Ably
export type ConnectionEvent = 'initialized' | 'connecting' | 'connected' | 'disconnected' | 'suspended' | 'closed' | 'failed' | 'update';

// Add TeamAvailability interface
export interface TeamAvailability {
  dailySchedule?: Array<{
    day: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
  }>;
  holidays?: Array<{
    date: string;
    name: string;
    type: 'holiday' | 'break' | 'maintenance';
  }>;
  timezone?: string;
  currentStatus?: 'online' | 'offline' | 'limited';
}

// Add interface for data collection form fields
export interface DataCollectionField {
  id: string;
  type: 'text' | 'email' | 'number' | 'select' | 'textarea';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}
