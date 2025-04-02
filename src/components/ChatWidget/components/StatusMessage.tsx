
import React from 'react';

interface StatusMessageProps {
  text: string;
}

const StatusMessage = ({ text }: StatusMessageProps) => {
  return (
    <div className="bg-gray-100 py-1 px-3 rounded-full text-xs text-gray-500 text-center">
      {text}
    </div>
  );
};

export default StatusMessage;
