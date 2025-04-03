
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
    <div className="bg-vivid-purple-700 text-white p-4 flex items-center justify-between shadow-sm z-10 relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-vivid-purple-600 to-vivid-purple-800 opacity-90"></div>
      
      {/* Background pattern overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" 
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.3) 2%, transparent 0%), 
                              radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.3) 2%, transparent 0%)`,
            backgroundSize: '100px 100px',
          }}>
        </div>
      </div>
      
      <div className="flex items-center gap-3 z-10 relative">
        <Button 
          variant="ghost" 
          className="p-2 h-auto w-auto text-white hover:bg-white/20 hover:text-white"
          onClick={onBack}
        >
          <ArrowLeft size={18} className="text-white" />
        </Button>
        
        <div>
          <h2 className="font-semibold text-sm tracking-tight">
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
          className="p-2 h-auto w-auto text-white hover:bg-white/20 hover:text-white relative z-10"
          onClick={onToggleSearch}
        >
          {showSearch ? <X size={18} /> : <Search size={18} />}
        </Button>
      )}
    </div>
  );
};

export default ChatHeader;
