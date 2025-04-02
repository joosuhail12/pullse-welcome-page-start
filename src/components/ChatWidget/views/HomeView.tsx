
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface HomeViewProps {
  onStartChat: () => void;
}

const HomeView = ({ onStartChat }: HomeViewProps) => {
  return (
    <div className="flex flex-col p-4 h-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-vivid-purple mb-2">Welcome to Pullse Chat</h2>
        <p className="text-gray-600">
          Get help, ask questions, or start a conversation.
        </p>
      </div>
      
      <div className="flex-grow flex flex-col justify-center items-center">
        <Button 
          onClick={onStartChat}
          className="bg-vivid-purple hover:bg-vivid-purple/90 flex items-center gap-2 px-6 py-2"
        >
          <MessageSquare size={18} />
          <span>Start a conversation</span>
        </Button>
      </div>
    </div>
  );
};

export default HomeView;
