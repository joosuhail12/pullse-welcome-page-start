
import React from 'react';
import { isTestMode } from '../utils/testMode';
import TestBadge from './TestBadge';

interface StatusMessageProps {
  text: string;
  isTestMode?: boolean;
  renderText?: (text: string) => React.ReactNode;
}

const StatusMessage = ({ text, isTestMode: explicitTestMode, renderText }: StatusMessageProps) => {
  // Check for test mode either from props or from utility function
  const showTestIndicator = explicitTestMode !== undefined ? explicitTestMode : isTestMode();
  
  const renderedContent = renderText ? renderText(text) : text;
  
  return (
    <div className="relative bg-gray-100 py-1 px-3 rounded-full text-xs text-gray-500 text-center">
      {renderedContent}
      
      {showTestIndicator && (
        <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-[8px] px-1 py-0.5 rounded-full">
          TEST
        </div>
      )}
    </div>
  );
};

export default StatusMessage;
