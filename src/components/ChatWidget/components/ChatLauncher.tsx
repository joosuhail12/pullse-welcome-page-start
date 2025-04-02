
import React from 'react';
import { MessageSquare, WifiOff, CloudOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ChatLauncherProps {
  isOpen: boolean;
  toggleChat: () => void;
  unreadCount: number;
  isConnected: boolean;
  connectionState: string;
  pendingMessages: number;
  primaryColor?: string;
  handleReconnect: () => void;
}

const ChatLauncher = ({
  isOpen,
  toggleChat,
  unreadCount,
  isConnected,
  connectionState,
  pendingMessages,
  primaryColor,
  handleReconnect
}: ChatLauncherProps) => {
  const buttonStyle = primaryColor
    ? { backgroundColor: primaryColor, borderColor: primaryColor }
    : {};

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end">
      {pendingMessages > 0 && (
        <div 
          className="mb-2 bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-xs flex items-center gap-1 cursor-help"
          title="Messages waiting to be sent when connection is restored"
          aria-live="polite"
        >
          <CloudOff size={12} aria-hidden="true" /> {pendingMessages} pending
        </div>
      )}
      
      <Button
        className="rounded-full w-14 h-14 flex items-center justify-center chat-widget-button relative"
        style={buttonStyle}
        onClick={toggleChat}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        aria-expanded={isOpen}
        aria-controls="chat-widget-container"
        aria-haspopup="dialog"
      >
        {!isConnected ? (
          <WifiOff size={24} className="text-white animate-pulse" aria-hidden="true" />
        ) : (
          <MessageSquare size={24} className="text-white" aria-hidden="true" />
        )}
        {!isOpen && unreadCount > 0 && (
          <Badge 
            className="absolute -top-2 -right-2 bg-red-500 text-white border-white border-2" 
            variant="destructive"
            aria-label={`${unreadCount} unread messages`}
          >
            {unreadCount}
          </Badge>
        )}
      </Button>
    </div>
  );
};

export default ChatLauncher;
