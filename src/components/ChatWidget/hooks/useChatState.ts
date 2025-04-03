
import { useState, useEffect, useCallback } from 'react';
import { ChatWidgetConfig } from '../config';
import { checkSessionValidity } from '../utils/security';

export type ChatTab = 'chat' | 'messages' | 'settings';

export interface ChatState {
  isOpen: boolean;
  activeTab: ChatTab;
  lastMessageSentTimestamp: number | null;
  hasUnreadMessages: boolean;
  isSearchOpen: boolean;
}

export function useChatState(config: ChatWidgetConfig) {
  const [state, setState] = useState<ChatState>({
    isOpen: false,
    activeTab: 'chat',
    lastMessageSentTimestamp: null,
    hasUnreadMessages: false,
    isSearchOpen: false
  });
  
  // Check session validity on mount and set up interval
  useEffect(() => {
    // Initial check
    checkSessionValidity();
    
    // Set up interval to check periodically
    const interval = setInterval(() => {
      checkSessionValidity();
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);
  
  const toggleOpen = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      isOpen: !prevState.isOpen,
      // Reset unread messages when opening
      hasUnreadMessages: prevState.isOpen ? prevState.hasUnreadMessages : false
    }));
  }, []);
  
  const setOpen = useCallback((isOpen: boolean) => {
    setState(prevState => ({
      ...prevState,
      isOpen,
      // Reset unread messages when opening
      hasUnreadMessages: isOpen ? false : prevState.hasUnreadMessages
    }));
  }, []);
  
  const setTab = useCallback((tab: ChatTab) => {
    setState(prevState => ({
      ...prevState,
      activeTab: tab
    }));
  }, []);
  
  const setHasUnreadMessages = useCallback((hasUnread: boolean) => {
    setState(prevState => ({
      ...prevState,
      hasUnreadMessages: hasUnread
    }));
  }, []);
  
  const toggleSearch = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      isSearchOpen: !prevState.isSearchOpen
    }));
  }, []);
  
  const setSearchOpen = useCallback((isOpen: boolean) => {
    setState(prevState => ({
      ...prevState,
      isSearchOpen: isOpen
    }));
  }, []);
  
  const updateLastMessageSentTimestamp = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      lastMessageSentTimestamp: Date.now()
    }));
  }, []);
  
  return {
    state,
    toggleOpen,
    setOpen,
    setTab,
    setHasUnreadMessages,
    toggleSearch,
    setSearchOpen,
    updateLastMessageSentTimestamp
  };
}

export default useChatState;
