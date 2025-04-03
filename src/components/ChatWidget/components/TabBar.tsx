
import React from 'react';
import { Home, MessageSquare } from 'lucide-react';

export type ViewState = 'home' | 'messages' | 'chat';

interface TabBarProps {
  viewState: ViewState;
  onChangeView: (view: ViewState) => void;
  activeTab?: string;
  onChangeTab?: (tab: string) => void;
}

const TabBar = ({ 
  viewState, 
  onChangeView,
  activeTab,
  onChangeTab
}: TabBarProps) => {
  // Use the activeTab and onChangeTab if provided, otherwise use viewState and onChangeView
  const currentTab = activeTab || viewState;
  const handleTabChange = (tab: string) => {
    if (onChangeTab) {
      onChangeTab(tab);
    } else if (tab === 'home' || tab === 'messages' || tab === 'chat') {
      onChangeView(tab as ViewState);
    }
  };

  return (
    <div className="border-t border-white/20 flex justify-around bg-white/60 backdrop-blur-sm">
      <button 
        onClick={() => handleTabChange('home')} 
        className={`flex flex-col items-center py-3 px-4 flex-1 ${
          currentTab === 'home' 
            ? 'text-vivid-purple border-t-2 border-vivid-purple -mt-px' 
            : 'text-gray-500 hover:text-vivid-purple/80 hover:bg-soft-purple-50'
        } transition-colors`}
        aria-label="Home"
        aria-current={currentTab === 'home' ? 'page' : undefined}
      >
        <Home size={20} />
        <span className="text-xs mt-1">Home</span>
      </button>
      <button 
        onClick={() => handleTabChange('messages')} 
        className={`flex flex-col items-center py-3 px-4 flex-1 ${
          currentTab === 'messages' 
            ? 'text-vivid-purple border-t-2 border-vivid-purple -mt-px' 
            : 'text-gray-500 hover:text-vivid-purple/80 hover:bg-soft-purple-50'
        } transition-colors`}
        aria-label="Messages"
        aria-current={currentTab === 'messages' ? 'page' : undefined}
      >
        <MessageSquare size={20} />
        <span className="text-xs mt-1">Messages</span>
      </button>
    </div>
  );
};

export default TabBar;
