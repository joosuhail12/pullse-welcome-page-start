
import React from 'react';

export interface StatusMessageProps {
  text: string;
}

const StatusMessage: React.FC<StatusMessageProps> = ({ text }) => {
  return (
    <div className="bg-gray-100 py-1.5 px-4 rounded-full text-xs text-gray-500 text-center shadow-sm">
      {text}
    </div>
  );
};

export default StatusMessage;
