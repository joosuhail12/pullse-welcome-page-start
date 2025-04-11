
import { useState, useCallback, useMemo } from 'react';
import { Message } from '../types';

export interface MessageSearchResult {
  id: string;
  index: number;
  text: string;
}

interface HighlightedPart {
  text: string;
  isHighlighted: boolean;
}

export function useMessageSearch(messages: Message[]) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<MessageSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [currentResultIndex, setCurrentResultIndex] = useState<number>(-1);

  // Memoize message IDs from search results for highlighting
  const messageIds = useMemo(() => {
    return searchResults.map(result => result.id);
  }, [searchResults]);

  // Function to highlight search term in text
  const highlightText = useCallback((text: string, term: string): HighlightedPart[] => {
    if (!term || !text) {
      return [{ text, isHighlighted: false }];
    }

    try {
      const regex = new RegExp(`(${term})`, 'gi');
      const parts = text.split(regex);

      return parts.map((part, i) => ({
        text: part,
        isHighlighted: part.toLowerCase() === term.toLowerCase()
      }));
    } catch (error) {
      console.error('Search regex error:', error);
      return [{ text, isHighlighted: false }];
    }
  }, []);

  // Function to search messages
  const searchMessages = useCallback((term: string) => {
    setSearchTerm(term);
    setIsSearching(true);

    if (!term.trim()) {
      setSearchResults([]);
      setCurrentResultIndex(-1);
      setIsSearching(false);
      return;
    }

    try {
      const results: MessageSearchResult[] = [];

      messages.forEach((message, index) => {
        // Skip non-text messages
        if (message.type !== 'text') return;

        const messageText = message.text.toLowerCase();
        const searchTermLower = term.toLowerCase();

        if (messageText.includes(searchTermLower)) {
          results.push({
            id: message.id,
            index,
            text: message.text
          });
        }
      });

      setSearchResults(results);
      setCurrentResultIndex(results.length > 0 ? 0 : -1);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setCurrentResultIndex(-1);
    } finally {
      setIsSearching(false);
    }
  }, [messages]);

  // Function to go to the next search result
  const nextSearchResult = useCallback(() => {
    if (searchResults.length === 0) return;

    setCurrentResultIndex(prevIndex => {
      const nextIndex = prevIndex + 1 >= searchResults.length ? 0 : prevIndex + 1;
      return nextIndex;
    });
  }, [searchResults.length]);

  // Function to go to the previous search result
  const prevSearchResult = useCallback(() => {
    if (searchResults.length === 0) return;

    setCurrentResultIndex(prevIndex => {
      const prevIdx = prevIndex - 1 < 0 ? searchResults.length - 1 : prevIndex - 1;
      return prevIdx;
    });
  }, [searchResults.length]);

  // Function to clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
    setCurrentResultIndex(-1);
    setIsSearching(false);
  }, []);

  // Get the current result
  const currentResult = useMemo(() => {
    if (currentResultIndex >= 0 && searchResults.length > 0) {
      return searchResults[currentResultIndex];
    }
    return null;
  }, [currentResultIndex, searchResults]);

  return {
    searchTerm,
    setSearchTerm,
    searchMessages,
    clearSearch,
    searchResults,
    messageIds,
    currentResult,
    nextSearchResult,
    prevSearchResult,
    highlightText,
    isSearching,
    resultCount: searchResults.length
  };
}
