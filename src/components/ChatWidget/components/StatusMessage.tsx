
import React from 'react';
import { AgentStatus } from '../types';
import SystemNotification from './MessageTypes/SystemNotification';

interface StatusMessageProps {
  text: string;
  renderText?: (text: string) => React.ReactNode;
  className?: string;
  type?: 'default' | 'info' | 'warning' | 'success' | 'error' | 'status-change';
  agentStatus?: AgentStatus;
  timestamp?: Date;
}

const StatusMessage = ({ 
  text, 
  renderText, 
  className = '',
  type = 'default',
  agentStatus,
  timestamp
}: StatusMessageProps) => {
  
  // Map legacy types to new SystemNotification types
  const mapType = (legacyType: string) => {
    switch (legacyType) {
      case 'status-change':
        return 'connection';
      case 'default':
        return 'info';
      default:
        return legacyType as 'info' | 'warning' | 'success' | 'error' | 'connection';
    }
  };

  return (
    <SystemNotification
      text={text}
      renderText={renderText}
      className={className}
      type={mapType(type)}
      timestamp={timestamp}
    />
  );
};

export default StatusMessage;
