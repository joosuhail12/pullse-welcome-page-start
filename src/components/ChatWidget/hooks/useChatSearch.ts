
import { useState, useCallback } from 'react';
import { Message } from '../types';
import { useMessageSearch } from './useMessageSearch';

export function useChatSearch(messages: Message[]) {
  const [showSearch, setShowSearch] = useState(false);
  
  // Use the message search hook with messages
  const {
    searchTerm,
    setSearchTerm,
    searchMessages,
    clearSearch,
    highlightText,
    messageIds,
    isSearching
  } = useMessageSearch(messages);

  // Toggle search bar
  const toggleSearch = useCallback(() => {
    setShowSearch(prev => !prev);
  }, []);

  return {
    showSearch,
    toggleSearch,
    searchTerm,
    searchMessages,
    clearSearch,
    highlightText,
    messageIds,
    isSearching
  };
}
