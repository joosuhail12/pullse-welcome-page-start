
import React from 'react';

interface ChatFooterProps {
  showBrandingBar?: boolean;
  isConnected: boolean;
  connectionState: string;
  handleReconnect: () => void;
}

const ChatFooter = ({ 
  showBrandingBar, 
  isConnected, 
  connectionState, 
  handleReconnect 
}: ChatFooterProps) => {
  if (!showBrandingBar) return null;
  
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
        onClick={!isConnected ? handleReconnect : undefined}
        style={{ cursor: !isConnected ? 'pointer' : 'default' }}
      />
    </div>
  );
};

export default ChatFooter;
