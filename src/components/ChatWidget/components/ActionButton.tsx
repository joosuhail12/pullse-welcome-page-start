
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { dispatchChatEvent } from '../utils/events';
import { ChatWidgetConfig } from '../config';

interface ActionButtonProps {
  typingComplete: boolean;
  buttonStyle: React.CSSProperties;
  onStartChat: () => void;
  config: ChatWidgetConfig;
}

const ActionButton = ({ typingComplete, buttonStyle, onStartChat, config }: ActionButtonProps) => {
  const handleStartChat = () => {
    // Always dispatch event when chat is initiated
    dispatchChatEvent('contact:initiatedChat', { showForm: config.preChatForm.enabled }, config);
    
    // Call the callback
    onStartChat();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleStartChat();
    }
  };

  return (
    <div 
      className="mt-auto transition-all duration-700 delay-200 ease-in-out"
      style={{ 
        opacity: typingComplete ? 1 : 0,
        transform: typingComplete ? 'translateY(0)' : 'translateY(10px)'
      }}
      aria-live="polite"
    >
      <Button 
        onClick={handleStartChat}
        onKeyDown={handleKeyDown}
        className="chat-widget-button group flex items-center justify-center gap-2 w-full py-5 rounded-xl shadow-md transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px] focus:ring-2 focus:ring-vivid-purple-300 focus:ring-offset-2 focus:outline-none"
        style={buttonStyle}
        aria-label="Start a conversation"
        tabIndex={typingComplete ? 0 : -1} // Only focusable when visible
      >
        <MessageSquare 
          size={20} 
          className="transition-transform duration-300 group-hover:rotate-12"
          aria-hidden="true"
        />
        <span className="font-medium">Start a conversation</span>
      </Button>
    </div>
  );
};

export default ActionButton;
