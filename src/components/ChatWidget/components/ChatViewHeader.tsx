
import React from 'react';
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

const ChatViewHeader = ({ 
  conversation, 
  onBack, 
  showSearch, 
  toggleSearch, 
  searchMessages, 
  clearSearch, 
  searchResultCount,
  isSearching,
  showSearchFeature
}: ChatViewHeaderProps) => {
  return (
    <div className="sticky top-0 z-20 shadow-md">
      <ChatHeader 
        conversation={conversation} 
        onBack={onBack} 
        onToggleSearch={showSearchFeature ? toggleSearch : undefined}
        showSearch={showSearch}
      />
      
      {showSearch && showSearchFeature && (
        <SearchBar 
          onSearch={searchMessages} 
          onClear={clearSearch} 
          resultCount={searchResultCount}
          isSearching={isSearching}
        />
      )}
    </div>
  );
};

export default ChatViewHeader;
