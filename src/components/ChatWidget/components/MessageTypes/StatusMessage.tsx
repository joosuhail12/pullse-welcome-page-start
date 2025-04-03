
import React from 'react';

export interface StatusMessageProps {
  text: string;
  renderText?: (text: string) => React.ReactNode;
}

const StatusMessage: React.FC<StatusMessageProps> = ({ text, renderText }) => {
  const renderedText = renderText ? renderText(text) : text;
  
  return (
    <div className="bg-gray-100 py-1.5 px-4 rounded-full text-xs text-gray-500 text-center shadow-sm">
      {renderedText}
    </div>
  );
};

export default StatusMessage;
