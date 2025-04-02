
import React from 'react';
import { Home, MessageSquare } from 'lucide-react';

type ViewState = 'home' | 'messages' | 'chat';

interface TabBarProps {
  viewState: ViewState;
  onChangeView: (view: ViewState) => void;
}

const TabBar = ({ viewState, onChangeView }: TabBarProps) => {
  const handleKeyDown = (e: React.KeyboardEvent, view: ViewState) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChangeView(view);
    }
  };

  return (
    <nav 
      className="border-t flex justify-around" 
      role="tablist"
      aria-label="Chat widget navigation"
    >
      <button 
        onClick={() => onChangeView('home')} 
        onKeyDown={(e) => handleKeyDown(e, 'home')}
        className={`flex flex-col items-center py-3 px-4 flex-1 ${
          viewState === 'home' 
            ? 'text-vivid-purple border-t-2 border-vivid-purple -mt-px' 
            : 'text-gray-500'
        }`}
        role="tab"
        aria-selected={viewState === 'home'}
        aria-controls="home-view"
        id="home-tab"
        tabIndex={viewState === 'home' ? 0 : -1}
      >
        <Home size={20} aria-hidden="true" />
        <span className="text-xs mt-1">Home</span>
      </button>
      <button 
        onClick={() => onChangeView('messages')} 
        onKeyDown={(e) => handleKeyDown(e, 'messages')}
        className={`flex flex-col items-center py-3 px-4 flex-1 ${
          viewState === 'messages' 
            ? 'text-vivid-purple border-t-2 border-vivid-purple -mt-px' 
            : 'text-gray-500'
        }`}
        role="tab"
        aria-selected={viewState === 'messages'}
        aria-controls="messages-view"
        id="messages-tab"
        tabIndex={viewState === 'messages' ? 0 : -1}
      >
        <MessageSquare size={20} aria-hidden="true" />
        <span className="text-xs mt-1">Messages</span>
      </button>
    </nav>
  );
};

export default TabBar;
