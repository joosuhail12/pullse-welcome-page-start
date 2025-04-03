
import React from 'react';
import { Conversation } from '../types';

interface MessagesViewProps {
  onSelectConversation: (conversation: Conversation) => void;
  testMode?: boolean;
}

const MessagesView: React.FC<MessagesViewProps> = ({ 
  onSelectConversation,
  testMode = false  
}) => {
  return (
    <div className="p-4">
      {testMode && (
        <div className="mb-4 p-2 bg-orange-100 border border-orange-200 rounded-md">
          <p className="text-orange-800 text-xs">
            <strong>Test Mode:</strong> This chat is in test mode. These conversations are simulated.
          </p>
        </div>
      )}
      
      <div className="text-center text-gray-500 p-8">
        <p>No previous conversations</p>
      </div>
    </div>
  );
};

export default MessagesView;
