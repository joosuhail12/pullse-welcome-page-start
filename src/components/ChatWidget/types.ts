export interface Message {
  id: string;
  text: string;
  type: MessageType;
  sender: UserType;
  timestamp: Date;
  metadata?: Record<string, any>;
  reaction?: 'thumbsUp' | 'thumbsDown';
  reactions?: string[];
  cardData?: {
    title?: string;
    description?: string;
    imageUrl?: string;
    buttons?: {
      text: string;
      url?: string;
      action?: string;
    }[];
  };
  quickReplies?: string[];
  status?: MessageStatus;
  // File properties
  fileName?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
}

export type MessageType = 'text' | 'image' | 'file' | 'card' | 'quickReplies' | 'system' | 'typing';
export type UserType = 'user' | 'agent' | 'system' | 'bot';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Conversation {
  id: string;
  title?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
  status?: 'active' | 'closed' | 'pending';
  participants?: string[];
  metadata?: Record<string, any>;
}

export interface UserData {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  metadata?: Record<string, any>;
}

export interface ChatState {
  viewState: 'welcome' | 'chat' | 'form' | 'conversations' | 'settings';
  messages: Message[];
  conversations: Conversation[];
  activeConversation: Conversation | null;
  userFormData: UserData;
  isTyping: boolean;
  error: string | null;
}

export interface ChatAction {
  type: string;
  payload?: any;
}

export interface ChatContextType {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  sendMessage: (text: string, type?: MessageType, metadata?: Record<string, any>) => void;
  startChat: () => void;
  endChat: () => void;
  backToMessages: () => void;
  changeView: (view: ChatState['viewState']) => void;
  selectConversation: (conversation: Conversation) => void;
  updateConversation: (conversation: Conversation) => void;
  setUserFormData: (data: UserData) => void;
}

export interface ChatWidgetTheme {
  primaryColor?: string;
  secondaryColor?: string;
  textColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
}
