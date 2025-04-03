
import { useState, useCallback } from 'react';
import { Message } from '../types';

export interface MessageSearchResult {
  messageId: string;
  matchText: string;
  timestamp: Date;
  conversationId: string;
  score: number;
}

export const useMessageSearch = (conversationId: string) => {
  const [searchResults, setSearchResults] = useState<MessageSearchResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);

  // Search through messages
  const searchMessages = useCallback((
    messages: Message[], 
    term: string
  ) => {
    if (!term.trim()) {
      setSearchResults([]);
      setSearchTerm('');
      return;
    }

    const results: MessageSearchResult[] = [];
    const lowerTerm = term.toLowerCase();

    messages.forEach(message => {
      if (message.text && message.text.toLowerCase().includes(lowerTerm)) {
        results.push({
          messageId: message.id,
          matchText: message.text,
          timestamp: message.timestamp,
          conversationId,
          score: 1.0
        });
      }
    });

    setSearchResults(results);
    setSearchTerm(term);
  }, [conversationId]);

  // Highlight search term in text
  const highlightTextWithTerm = useCallback((text: string, term: string) => {
    if (!term.trim() || !text) {
      return [{ text, highlighted: false }];
    }

    const lowerText = text.toLowerCase();
    const lowerTerm = term.toLowerCase();
    const result: { text: string; highlighted: boolean }[] = [];
    let lastIndex = 0;

    let index = lowerText.indexOf(lowerTerm);
    while (index !== -1) {
      if (index > lastIndex) {
        result.push({
          text: text.substring(lastIndex, index),
          highlighted: false
        });
      }

      result.push({
        text: text.substring(index, index + term.length),
        highlighted: true
      });

      lastIndex = index + term.length;
      index = lowerText.indexOf(lowerTerm, lastIndex);
    }

    if (lastIndex < text.length) {
      result.push({
        text: text.substring(lastIndex),
        highlighted: false
      });
    }

    return result;
  }, []);

  return {
    searchResults,
    searchTerm,
    searchMessages,
    highlightTextWithTerm,
    highlightedMessageId,
    setHighlightedMessageId
  };
};
