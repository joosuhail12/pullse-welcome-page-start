
import React from 'react';

export interface StatusMessageProps {
  text: string;
  renderText?: (text: string) => React.ReactNode;
}

const StatusMessage: React.FC<StatusMessageProps> = ({ text, renderText }) => {
  const renderedText = renderText ? renderText(text) : text;
  
  return (
    <div className="text-center text-sm text-gray-500">
      {renderedText}
    </div>
  );
};

export default StatusMessage;
