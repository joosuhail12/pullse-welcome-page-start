
import { useState, useCallback, useMemo } from 'react';
import { Message } from '../types';

export interface MessageSearchResult {
  messageId: string;
  matchIndex: number;
}

export const useSearchMessages = (messages: Message[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [messageIds, setMessageIds] = useState<string[]>([]);
  
  // Search messages for a term
  const searchMessages = useCallback((term: string, specificIds?: string[]) => {
    if (!term) {
      setMessageIds([]);
      setSearchTerm('');
      return;
    }
    
    setSearchTerm(term);
    
    const lowerTerm = term.toLowerCase();
    const results: MessageSearchResult[] = [];
    
    // If specific IDs are provided, only search those messages
    const messagesToSearch = specificIds 
      ? messages.filter(msg => specificIds.includes(msg.id))
      : messages;
    
    messagesToSearch.forEach(message => {
      const lowerText = message.text.toLowerCase();
      const matchIndex = lowerText.indexOf(lowerTerm);
      
      if (matchIndex !== -1) {
        results.push({
          messageId: message.id,
          matchIndex
        });
      }
    });
    
    // Sort by match index to prioritize matches at the beginning of messages
    results.sort((a, b) => a.matchIndex - b.matchIndex);
    
    // Extract just the message IDs for the result
    setMessageIds(results.map(result => result.messageId));
    
  }, [messages]);
  
  // Highlight text with search term
  const highlightTextWithTerm = useCallback((text: string, term: string) => {
    if (!term) return [{ text, highlighted: false }];
    
    const parts: { text: string; highlighted: boolean }[] = [];
    const lowerText = text.toLowerCase();
    const lowerTerm = term.toLowerCase();
    
    let lastIndex = 0;
    let index = lowerText.indexOf(lowerTerm, lastIndex);
    
    while (index !== -1) {
      // Add non-highlighted part
      if (index > lastIndex) {
        parts.push({ 
          text: text.substring(lastIndex, index), 
          highlighted: false 
        });
      }
      
      // Add highlighted part
      parts.push({ 
        text: text.substring(index, index + term.length), 
        highlighted: true 
      });
      
      lastIndex = index + term.length;
      index = lowerText.indexOf(lowerTerm, lastIndex);
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({ 
        text: text.substring(lastIndex), 
        highlighted: false 
      });
    }
    
    return parts.length > 0 ? parts : [{ text, highlighted: false }];
  }, []);
  
  return {
    searchTerm,
    messageIds,
    searchMessages,
    highlightTextWithTerm
  };
};

export default useSearchMessages;
