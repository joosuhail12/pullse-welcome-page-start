
import { useState, useCallback } from 'react';
import { Message, MessageSearchResult } from '../types';

export function useMessageSearch(messages: Message[]) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<MessageSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<number>(-1);

  const searchMessages = useCallback((term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      setCurrentResult(-1);
      return;
    }

    setIsSearching(true);
    
    // Simple search implementation - can be expanded with more sophisticated search
    const results: MessageSearchResult[] = [];
    
    messages.forEach(message => {
      if (message.text && message.text.toLowerCase().includes(term.toLowerCase())) {
        results.push({
          messageId: message.id,
          matchText: message.text,
          timestamp: message.timestamp
        });
      }
    });
    
    setSearchResults(results);
    setCurrentResult(results.length > 0 ? 0 : -1);
    setIsSearching(false);
  }, [messages]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
    setCurrentResult(-1);
  }, []);

  const scrollToNextResult = useCallback(() => {
    if (searchResults.length === 0) return;
    
    const nextIdx = (currentResult + 1) % searchResults.length;
    setCurrentResult(nextIdx);
    
    // Scroll to the message element
    const messageElement = document.getElementById(searchResults[nextIdx].messageId);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [searchResults, currentResult]);

  const scrollToPrevResult = useCallback(() => {
    if (searchResults.length === 0) return;
    
    const prevIdx = (currentResult - 1 + searchResults.length) % searchResults.length;
    setCurrentResult(prevIdx);
    
    // Scroll to the message element
    const messageElement = document.getElementById(searchResults[prevIdx].messageId);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [searchResults, currentResult]);

  // Helper function to highlight text based on search term
  // Returns an array of parts with highlighted status instead of JSX
  const highlightText = useCallback((text: string, term: string): { text: string; highlighted: boolean }[] => {
    if (!term.trim() || !text) return [{ text, highlighted: false }];
    
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part) => ({
      text: part,
      highlighted: regex.test(part)
    }));
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    searchMessages,
    clearSearch,
    isSearching,
    currentResult,
    scrollToNextResult,
    scrollToPrevResult,
    highlightText,
    messageIds: searchResults.map(r => r.messageId)
  };
}
