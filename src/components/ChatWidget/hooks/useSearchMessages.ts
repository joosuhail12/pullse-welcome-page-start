
import { useState, useCallback } from 'react';
import { Message, MessageSearchResult } from '../types';

interface SearchMessagesReturn {
  searchMessages: (term: string, highlightIds?: string[]) => void;
  messageIds: string[];
  highlightTextWithTerm: (text: string, term: string) => Array<{ text: string; highlighted: boolean }>;
}

export const useSearchMessages = (messages: Message[]): SearchMessagesReturn => {
  const [messageIds, setMessageIds] = useState<string[]>([]);

  // Search messages by term
  const searchMessages = useCallback((term: string, highlightIds: string[] = []) => {
    if (!term.trim() && !highlightIds.length) {
      setMessageIds([]);
      return;
    }
    
    // If specific IDs are provided, use those
    if (highlightIds.length > 0) {
      setMessageIds(highlightIds);
      return;
    }
    
    // Search in messages
    const results: MessageSearchResult[] = [];
    const searchTerm = term.toLowerCase().trim();
    
    messages.forEach(message => {
      if (message.text && message.text.toLowerCase().includes(searchTerm)) {
        results.push({
          messageId: message.id,
          conversationId: '', // Not needed for single conversation search
          score: 1,
          matchText: message.text,
        });
      }
    });
    
    // Sort by score and extract message IDs
    const sortedIds = results
      .sort((a, b) => b.score - a.score)
      .map(result => result.messageId);
      
    setMessageIds(sortedIds);
  }, [messages]);

  // Highlight text based on search term
  const highlightTextWithTerm = useCallback((text: string, term: string): Array<{ text: string; highlighted: boolean }> => {
    if (!term.trim()) {
      return [{ text, highlighted: false }];
    }

    const parts: Array<{ text: string; highlighted: boolean }> = [];
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          text: text.substring(lastIndex, match.index),
          highlighted: false,
        });
      }

      parts.push({
        text: match[0],
        highlighted: true,
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push({
        text: text.substring(lastIndex),
        highlighted: false,
      });
    }

    return parts;
  }, []);

  return {
    searchMessages,
    messageIds,
    highlightTextWithTerm,
  };
};
