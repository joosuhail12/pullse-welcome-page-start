
import React from 'react';

interface StatusMessageProps {
  text: string;
  renderText?: (text: string) => React.ReactNode;
  className?: string;
}

const StatusMessage = ({ text, renderText, className = '' }: StatusMessageProps) => {
  return (
    <div className={`bg-gray-100/80 py-1.5 px-5 rounded-full text-xs font-medium text-gray-500 text-center shadow-sm border border-gray-100 ${className}`}>
      {renderText ? renderText(text) : text}
    </div>
  );
};

export default StatusMessage;
