
import React from 'react';
import { Home, MessageSquare } from 'lucide-react';

type ViewState = 'home' | 'messages' | 'chat';

interface TabBarProps {
  viewState: ViewState;
  onChangeView: (view: ViewState) => void;
}

const TabBar = ({ viewState, onChangeView }: TabBarProps) => {
  return (
    <div className="border-t border-white/20 flex justify-around bg-white/60 backdrop-blur-sm">
      <button 
        onClick={() => onChangeView('home')} 
        className={`flex flex-col items-center py-3 px-4 flex-1 ${
          viewState === 'home' 
            ? 'text-vivid-purple border-t-2 border-vivid-purple -mt-px' 
            : 'text-gray-500 hover:text-vivid-purple/80 hover:bg-soft-purple-50'
        } transition-colors`}
        aria-label="Home"
        aria-current={viewState === 'home' ? 'page' : undefined}
      >
        <Home size={20} />
        <span className="text-xs mt-1">Home</span>
      </button>
      <button 
        onClick={() => onChangeView('messages')} 
        className={`flex flex-col items-center py-3 px-4 flex-1 ${
          viewState === 'messages' 
            ? 'text-vivid-purple border-t-2 border-vivid-purple -mt-px' 
            : 'text-gray-500 hover:text-vivid-purple/80 hover:bg-soft-purple-50'
        } transition-colors`}
        aria-label="Messages"
        aria-current={viewState === 'messages' ? 'page' : undefined}
      >
        <MessageSquare size={20} />
        <span className="text-xs mt-1">Messages</span>
      </button>
    </div>
  );
};

export default TabBar;
