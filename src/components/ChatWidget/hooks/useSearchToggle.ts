
import { useState, useCallback } from 'react';

/**
 * Hook for managing search visibility state
 */
export function useSearchToggle(clearSearch: () => void) {
  const [showSearch, setShowSearch] = useState(false);
  
  const toggleSearch = useCallback(() => {
    setShowSearch(prev => !prev);
    if (showSearch) {
      clearSearch();
    }
  }, [showSearch, clearSearch]);
  
  return {
    showSearch,
    toggleSearch
  };
}
