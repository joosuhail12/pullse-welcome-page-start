
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button'; 
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  resultCount?: number;
  isSearching?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = "Search...", 
  value, 
  onChange, 
  onClear,
  resultCount,
  isSearching
}) => {
  return (
    <div className="relative flex items-center gap-2 w-full">
      <div className="relative flex-grow">
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search size={16} />
        </div>
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="pl-8 py-1 h-8 text-sm w-full"
        />
        {value && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={onClear}
          >
            <X size={14} />
          </Button>
        )}
      </div>
      {isSearching ? (
        <div className="text-xs text-gray-500">Searching...</div>
      ) : value && resultCount !== undefined ? (
        <div className="text-xs text-gray-500">
          {resultCount} {resultCount === 1 ? 'result' : 'results'}
        </div>
      ) : null}
    </div>
  );
};

export default SearchBar;
