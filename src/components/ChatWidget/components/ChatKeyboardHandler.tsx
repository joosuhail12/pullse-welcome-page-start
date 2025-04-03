
import React, { useEffect } from 'react';

interface ChatKeyboardHandlerProps {
  messageText: string;
  handleSendMessage: () => void;
  toggleSearch: () => void;
  showSearch: boolean;
  showSearchFeature: boolean;
}

const ChatKeyboardHandler: React.FC<React.PropsWithChildren<ChatKeyboardHandlerProps>> = ({ 
  children,
  messageText,
  handleSendMessage,
  toggleSearch,
  showSearch,
  showSearchFeature
}) => {
  // Effect to add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+/ to focus search
      if (e.altKey && e.key === '/' && showSearchFeature) {
        e.preventDefault();
        toggleSearch();
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
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [messageText, handleSendMessage, toggleSearch, showSearch, showSearchFeature]);

  return <>{children}</>;
};

export default ChatKeyboardHandler;
