
import React from 'react';

interface StatusMessageProps {
  text: string;
}

const StatusMessage = ({ text }: StatusMessageProps) => {
  return (
    <div className="bg-gray-100 py-1.5 px-4 rounded-full text-xs text-gray-500 text-center shadow-sm">
      {text}
    </div>
  );
};

export default StatusMessage;
