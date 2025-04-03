
import React, { useCallback } from 'react';
import { Conversation } from '../types';
import ChatHeader from './ChatHeader';
import SearchBar from './SearchBar';

interface ChatViewHeaderProps {
  conversation: Conversation;
  onBack: () => void;
  showSearch: boolean;
  toggleSearch: () => void;
  searchMessages: (term: string) => void;
  clearSearch: () => void;
  searchResultCount: number;
  isSearching: boolean;
  showSearchFeature: boolean;
}

const ChatViewHeader: React.FC<ChatViewHeaderProps> = React.memo(({ 
  conversation, 
  onBack, 
  showSearch, 
  toggleSearch, 
  searchMessages, 
  clearSearch, 
  searchResultCount,
  isSearching,
  showSearchFeature
}) => {
  // Memoize search handler using useCallback
  const handleSearch = useCallback((term: string) => {
    searchMessages(term);
  }, [searchMessages]);
  
  // Memoize clear handler using useCallback
  const handleClear = useCallback(() => {
    clearSearch();
  }, [clearSearch]);
  
  return (
    <>
      <ChatHeader 
        conversation={conversation} 
        onBack={onBack} 
        onToggleSearch={showSearchFeature ? toggleSearch : undefined}
        showSearch={showSearch}
      />
      
      {showSearch && showSearchFeature && (
        <SearchBar 
          onSearch={handleSearch}
          onClear={handleClear}
          resultCount={searchResultCount}
          isSearching={isSearching}
        />
      )}
    </>
  );
});

// Add displayName for debugging
ChatViewHeader.displayName = 'ChatViewHeader';

export default ChatViewHeader;
