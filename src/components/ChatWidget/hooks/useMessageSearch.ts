
import { useState, useCallback, useMemo } from 'react';
import { Message } from '../types';

// Interface for search results
interface MessageSearchResult {
  id: string;
  indices: [number, number][];
}

export function useMessageSearch(messages: Message[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Search messages for the search term
  const searchMessages = useCallback((term: string) => {
    setSearchTerm(term);
    setIsSearching(true);
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setIsSearching(false);
  }, []);

  // Find matching message IDs and their match indices
  const messageIds = useMemo(() => {
    if (!searchTerm || !isSearching) return [];

    return messages
      .filter(message => 
        message.text.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map(message => message.id);
  }, [messages, searchTerm, isSearching]);

  // Highlight search term in text
  const highlightText = useCallback((text: string, term: string) => {
    if (!term) return [{ text, highlighted: false }];
    
    const parts: { text: string; highlighted: boolean }[] = [];
    const regex = new RegExp(`(${term})`, 'gi');
    let lastIndex = 0;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      // Add non-matching part before this match
      if (match.index > lastIndex) {
        parts.push({
          text: text.substring(lastIndex, match.index),
          highlighted: false
        });
      }
      
      // Add matching part
      parts.push({
        text: match[0],
        highlighted: true
      });
      
      lastIndex = regex.lastIndex;
    }
    
    // Add remaining text after last match
    if (lastIndex < text.length) {
      parts.push({
        text: text.substring(lastIndex),
        highlighted: false
      });
    }
    
    return parts;
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    searchMessages,
    clearSearch,
    highlightText,
    messageIds,
    isSearching
  };
}
