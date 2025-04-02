
import React from 'react';
import { Conversation } from '../types';
import { ArrowLeft, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AgentPresence from './AgentPresence';

interface ChatHeaderProps {
  conversation: Conversation;
  onBack: () => void;
  onToggleSearch?: () => void;
  showSearch?: boolean;
}

const ChatHeader = ({ conversation, onBack, onToggleSearch, showSearch }: ChatHeaderProps) => {
  return (
    <header 
      className="bg-vivid-purple text-white p-4 flex items-center justify-between shadow-sm z-10"
      role="banner"
    >
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          className="p-2 h-auto w-auto text-white hover:text-white hover:bg-vivid-purple/90"
          onClick={onBack}
          aria-label="Go back"
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </Button>
        
        <div>
          <h2 className="font-medium" id="conversation-title">
            {conversation.title || 'Support Chat'}
          </h2>
          <AgentPresence 
            workspaceId={conversation.id.split(':')[0]}
          />
        </div>
      </div>
      
      {onToggleSearch && (
        <Button
          variant="ghost"
          className="p-2 h-auto w-auto text-white hover:text-white hover:bg-vivid-purple/90"
          onClick={onToggleSearch}
          aria-label={showSearch ? "Close search" : "Search messages"}
          aria-expanded={showSearch}
          aria-controls="search-panel"
        >
          {showSearch ? <X size={18} aria-hidden="true" /> : <Search size={18} aria-hidden="true" />}
        </Button>
      )}
    </header>
  );
};

export default ChatHeader;
