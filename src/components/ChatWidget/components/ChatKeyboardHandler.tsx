
import React, { useEffect } from 'react';
import { toast } from 'sonner';

interface ChatKeyboardHandlerProps {
  messageText: string;
  handleSendMessage: () => void;
  toggleSearch: () => void;
  showSearch: boolean;
  showSearchFeature: boolean;
  scrollToBottom?: () => void;
  loadOlderMessages?: () => void;
  enableKeyboardToasts?: boolean;
}

const ChatKeyboardHandler: React.FC<React.PropsWithChildren<ChatKeyboardHandlerProps>> = ({ 
  children,
  messageText,
  handleSendMessage,
  toggleSearch,
  showSearch,
  showSearchFeature,
  scrollToBottom,
  loadOlderMessages,
  enableKeyboardToasts = false
}) => {
  // Effect to add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+/ to focus search
      if (e.altKey && e.key === '/' && showSearchFeature) {
        e.preventDefault();
        toggleSearch();
        
        if (enableKeyboardToasts) {
          toast.success('Search activated');
        }
      }
      
      // Alt+Enter to send message
      if (e.altKey && e.key === 'Enter' && messageText.trim().length > 0) {
        e.preventDefault();
        handleSendMessage();
      }
      
      // Escape to close search
      if (e.key === 'Escape' && showSearch) {
        e.preventDefault();
        toggleSearch();
      }
      
      // Alt+End to scroll to bottom
      if (e.altKey && e.key === 'End' && scrollToBottom) {
        e.preventDefault();
        scrollToBottom();
        
        if (enableKeyboardToasts) {
          toast.success('Scrolled to latest messages');
        }
      }
      
      // Alt+Home to load older messages
      if (e.altKey && e.key === 'Home' && loadOlderMessages) {
        e.preventDefault();
        loadOlderMessages();
        
        if (enableKeyboardToasts) {
          toast.success('Loading older messages');
        }
      }
      
      // Alt+R to quick reply to last message (if function provided)
      if (e.altKey && e.key === 'r') {
        // This would be connected via props if implemented
        // We're preparing the interface for future functionality
        
        if (enableKeyboardToasts) {
          toast.info('Quick reply shortcut pressed');
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    messageText, 
    handleSendMessage, 
    toggleSearch, 
    showSearch, 
    showSearchFeature, 
    scrollToBottom, 
    loadOlderMessages, 
    enableKeyboardToasts
  ]);

  return <>{children}</>;
};

export default ChatKeyboardHandler;
