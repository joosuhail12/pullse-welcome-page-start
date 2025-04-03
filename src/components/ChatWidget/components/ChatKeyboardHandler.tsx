import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { KeyboardShortcutProps } from './KeyboardShortcutsInfo';

interface ChatKeyboardHandlerProps {
  children: React.ReactNode;
  messageText: string;
  handleSendMessage: () => void;
  toggleSearch: () => void;
  showSearch: boolean;
  showSearchFeature: boolean;
  scrollToBottom?: () => void;
  loadOlderMessages?: () => void;
  enableKeyboardToasts?: boolean;
  customShortcuts?: KeyboardShortcutProps[];
}

const ChatKeyboardHandler: React.FC<ChatKeyboardHandlerProps> = ({ 
  children,
  messageText,
  handleSendMessage,
  toggleSearch,
  showSearch,
  showSearchFeature,
  scrollToBottom,
  loadOlderMessages,
  enableKeyboardToasts = false,
  customShortcuts = []
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === '/' && showSearchFeature) {
        e.preventDefault();
        toggleSearch();
        
        if (enableKeyboardToasts) {
          toast.success('Search activated');
        }
      }
      
      if (e.altKey && e.key === 'Enter' && messageText.trim().length > 0) {
        e.preventDefault();
        handleSendMessage();
      }
      
      if (e.key === 'Escape' && showSearch) {
        e.preventDefault();
        toggleSearch();
      }
      
      if (e.altKey && e.key === 'End' && scrollToBottom) {
        e.preventDefault();
        scrollToBottom();
        
        if (enableKeyboardToasts) {
          toast.success('Scrolled to latest messages');
        }
      }
      
      if (e.altKey && e.key === 'Home' && loadOlderMessages) {
        e.preventDefault();
        loadOlderMessages();
        
        if (enableKeyboardToasts) {
          toast.success('Loading older messages');
        }
      }
      
      if (e.altKey && e.key === 'r') {
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
    enableKeyboardToasts,
    customShortcuts
  ]);

  return <>{children}</>;
};

export default ChatKeyboardHandler;
