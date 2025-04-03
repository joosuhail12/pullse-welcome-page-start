
import { useState, useCallback } from 'react';

// Define the search result interface
export interface MessageSearchResult {
  id: string;
  messageId: string;
  text: string;
  matchText: string;
  timestamp: Date;
  isUserMessage: boolean;
}

export function useMessageSearch() {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<MessageSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSelectedResultIndex(-1);
      return;
    }

    setIsSearching(true);

    try {
      // This would typically call an API or search through local messages
      // For now, we'll just create a mock result
      setTimeout(() => {
        const mockResults: MessageSearchResult[] = [
          {
            id: 'search-1',
            messageId: 'msg-123',
            text: 'This is a sample message with the search term',
            matchText: 'search term',
            timestamp: new Date(),
            isUserMessage: false,
          }
        ];
        
        setSearchResults(mockResults);
        setIsSearching(false);
        if (mockResults.length > 0) {
          setSelectedResultIndex(0);
        }
      }, 500);
    } catch (error) {
      console.error('Error searching messages:', error);
      setIsSearching(false);
    }
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchText(query);
    performSearch(query);
  }, [performSearch]);

  const selectNextResult = useCallback(() => {
    if (searchResults.length === 0) return;
    setSelectedResultIndex((prev) => (prev + 1) % searchResults.length);
  }, [searchResults.length]);

  const selectPreviousResult = useCallback(() => {
    if (searchResults.length === 0) return;
    setSelectedResultIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
  }, [searchResults.length]);

  const clearSearch = useCallback(() => {
    setSearchText('');
    setSearchResults([]);
    setSelectedResultIndex(-1);
  }, []);

  return {
    searchText,
    handleSearch,
    searchResults,
    isSearching,
    selectedResultIndex,
    selectNextResult,
    selectPreviousResult,
    clearSearch,
  };
}

export default useMessageSearch;
