
import { useState, useCallback } from 'react';

/**
 * Hook for handling loading more messages functionality
 */
export function useLoadMoreMessages(loadPreviousMessages?: () => Promise<void>) {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const handleLoadMoreMessages = useCallback(async () => {
    if (!loadPreviousMessages) return;
    
    setIsLoadingMore(true);
    try {
      await loadPreviousMessages();
    } finally {
      setIsLoadingMore(false);
    }
  }, [loadPreviousMessages]);
  
  return {
    isLoadingMore,
    handleLoadMoreMessages
  };
}
