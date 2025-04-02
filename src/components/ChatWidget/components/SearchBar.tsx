
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button'; 
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (term: string) => void;
  onClear: () => void;
  resultCount: number;
  isSearching: boolean;
}

const SearchBar = ({ onSearch, onClear, resultCount, isSearching }: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedTerm, setDebouncedTerm] = useState<string>('');

  // Debounce search term
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timerId);
  }, [searchTerm]);

  // Perform search when debounced term changes
  useEffect(() => {
    if (debouncedTerm) {
      onSearch(debouncedTerm);
    } else if (debouncedTerm === '') {
      onClear();
    }
  }, [debouncedTerm, onSearch, onClear]);

  const handleClear = () => {
    setSearchTerm('');
    onClear();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div 
      className="relative flex items-center gap-2 p-2 border-b border-gray-100"
      id="search-panel"
      role="search"
      aria-label="Search messages"
    >
      <div className="relative flex-grow">
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search size={16} aria-hidden="true" />
        </div>
        <Input
          type="text"
          placeholder="Search messages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-8 py-1 h-8 text-sm"
          aria-label="Search messages"
          aria-autocomplete="list"
          aria-controls="search-results"
          aria-expanded={searchTerm.length > 0}
        />
        {searchTerm && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X size={14} aria-hidden="true" />
          </Button>
        )}
      </div>
      {isSearching ? (
        <div className="text-xs text-gray-500" aria-live="polite">Searching...</div>
      ) : searchTerm ? (
        <div 
          className="text-xs text-gray-500" 
          aria-live="polite"
          id="search-results"
        >
          {resultCount} {resultCount === 1 ? 'result' : 'results'}
        </div>
      ) : null}
    </div>
  );
};

export default SearchBar;
