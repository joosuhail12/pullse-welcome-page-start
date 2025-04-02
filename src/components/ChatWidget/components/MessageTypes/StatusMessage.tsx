
import React from 'react';

interface StatusMessageProps {
  text: string;
  renderText: (text: string) => React.ReactNode;
}

const StatusMessage = ({ text, renderText }: StatusMessageProps) => {
  return (
    <div className="bg-gray-100 py-1.5 px-4 rounded-full text-xs text-gray-500 text-center shadow-sm">
      {renderText(text)}
    </div>
  );
};

export default StatusMessage;
