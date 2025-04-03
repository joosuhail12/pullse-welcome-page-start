
import React from 'react';

export interface StatusMessageProps {
  text: string;
}

const StatusMessage: React.FC<StatusMessageProps> = ({ text }) => {
  return (
    <div className="text-xs text-gray-500">{text}</div>
  );
};

export default StatusMessage;
