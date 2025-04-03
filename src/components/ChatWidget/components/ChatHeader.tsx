
import React from 'react';
import { Conversation } from '../types';
import { ArrowLeft, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AgentPresence from './AgentPresence';
import { Progress } from '@/components/ui/progress';

interface ChatHeaderProps {
  conversation: Conversation;
  onBack: () => void;
  onToggleSearch?: () => void;
  showSearch?: boolean;
  ticketProgress?: number; // New prop for ticket progress
}

const ChatHeader = ({ conversation, onBack, onToggleSearch, showSearch, ticketProgress }: ChatHeaderProps) => {
  return (
    <div className="bg-vivid-purple-700 text-white p-2 sm:p-4 flex flex-col shadow-sm z-10 relative overflow-hidden">
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
      
      <div className="flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button 
            variant="ghost" 
            className="p-1 sm:p-2 h-auto w-auto text-white hover:bg-white/20 hover:text-white"
            onClick={onBack}
          >
            <ArrowLeft size={16} className="text-white" />
          </Button>
          
          <div>
            <h2 className="font-semibold text-xs sm:text-sm tracking-tight">
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
            className="p-1 sm:p-2 h-auto w-auto text-white hover:bg-white/20 hover:text-white relative z-10"
            onClick={onToggleSearch}
          >
            {showSearch ? <X size={16} /> : <Search size={16} />}
          </Button>
        )}
      </div>
      
      {/* Ticket progress bar */}
      {ticketProgress !== undefined && (
        <div className="mt-2 px-2 z-10 relative">
          <div className="flex justify-between text-[10px] sm:text-xs mb-1">
            <span>Ticket Progress</span>
            <span>{Math.round(ticketProgress)}%</span>
          </div>
          <Progress value={ticketProgress} className="h-1.5 sm:h-2 w-full bg-white/30" />
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
