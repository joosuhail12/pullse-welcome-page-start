
import React from 'react';

interface ChatFooterProps {
  showBrandingBar?: boolean;
  isConnected: boolean;
  connectionState: string;
  handleReconnect: () => void;
}

const ChatFooter = React.memo(({ 
  showBrandingBar, 
  isConnected, 
  connectionState, 
  handleReconnect 
}: ChatFooterProps) => {
  if (!showBrandingBar) return null;
  
  // Use memoized handler to avoid causing re-renders
  const handleClick = React.useCallback(() => {
    if (!isConnected) {
      handleReconnect();
    }
  }, [isConnected, handleReconnect]);
  
  return (
    <div className="mt-auto border-t border-gray-100 p-2 flex items-center justify-center gap-1 text-xs text-gray-400">
      <span>Powered by</span>
      <img 
        src="https://framerusercontent.com/images/9N8Z1vTRbJsHlrIuTjm6Ajga4dI.png" 
        alt="Pullse Logo" 
        className="h-4 w-auto"
      />
      <span>Pullse</span>
      
      <div 
        className={`ml-1 w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'
        }`} 
        title={`Connection: ${connectionState}`}
        onClick={handleClick}
        style={{ cursor: !isConnected ? 'pointer' : 'default' }}
      />
    </div>
  );
});

ChatFooter.displayName = 'ChatFooter';

export default ChatFooter;
