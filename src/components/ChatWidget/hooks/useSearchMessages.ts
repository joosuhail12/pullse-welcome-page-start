
import { useCallback, useState } from 'react';
import { Message, MessageSearchResult } from '../types';

interface SearchMessagesResult {
  searchMessages: (term: string, highlightMessageIds?: string[]) => void;
  messageIds: string[];
  highlightTextWithTerm: (text: string, term: string) => Array<{ text: string; highlighted: boolean }>;
  results: MessageSearchResult[];
}

export const useSearchMessages = (messages: Message[]): SearchMessagesResult => {
  const [results, setResults] = useState<MessageSearchResult[]>([]);
  const [messageIds, setMessageIds] = useState<string[]>([]);

  const searchMessages = useCallback((term: string, highlightMessageIds?: string[]) => {
    if (!term && !highlightMessageIds?.length) {
      setResults([]);
      setMessageIds([]);
      return;
    }

    // If highlightMessageIds is provided, just highlight those messages
    if (highlightMessageIds?.length) {
      setMessageIds(highlightMessageIds);
      return;
    }

    const searchResults: MessageSearchResult[] = [];
    const matchedIds: string[] = [];
    const lowercaseTerm = term.toLowerCase();

    messages.forEach(message => {
      const textMatch = message.text.toLowerCase().indexOf(lowercaseTerm);
      if (textMatch >= 0) {
        matchedIds.push(message.id);
        searchResults.push({
          messageId: message.id,
          conversationId: 'current', // This would come from conversation.id in real implementation
          score: 1.0,
          highlight: [message.text],
          matchText: message.text,
          timestamp: message.timestamp
        });
      }
    });

    setResults(searchResults);
    setMessageIds(matchedIds);
  }, [messages]);

  const highlightTextWithTerm = useCallback((text: string, term: string) => {
    if (!term) {
      return [{ text, highlighted: false }];
    }

    const parts = [];
    let lastIndex = 0;
    const termLowerCase = term.toLowerCase();
    const textLowerCase = text.toLowerCase();

    let index = textLowerCase.indexOf(termLowerCase);
    while (index !== -1) {
      if (index > lastIndex) {
        parts.push({
          text: text.slice(lastIndex, index),
          highlighted: false
        });
      }

      parts.push({
        text: text.slice(index, index + term.length),
        highlighted: true
      });

      lastIndex = index + term.length;
      index = textLowerCase.indexOf(termLowerCase, lastIndex);
    }

    if (lastIndex < text.length) {
      parts.push({
        text: text.slice(lastIndex),
        highlighted: false
      });
    }

    return parts;
  }, []);

  return { searchMessages, messageIds, highlightTextWithTerm, results };
};
