
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, X, Phone } from 'lucide-react';
import SearchBar from '../../components/SearchBar';

interface ChatHeaderProps {
  title: string;
  onBack: () => void;
  onSearch: () => void;
  onEndChat: () => void;
  showSearch: boolean;
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  onBack,
  onSearch,
  onEndChat,
  showSearch,
  searchTerm,
  onSearchChange
}) => {
  return (
    <div className="border-b border-gray-200 bg-white p-2 sm:p-3 flex flex-col">
      {showSearch ? (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSearch}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <SearchBar
              placeholder="Search messages..."
              value={searchTerm}
              onChange={onSearchChange}
              onClear={() => onSearchChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)}
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h3 className="font-medium text-sm">{title}</h3>
            </div>
          </div>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={onSearch}
              className="h-8 w-8"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onEndChat}
              className="h-8 w-8 text-red-500"
            >
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
