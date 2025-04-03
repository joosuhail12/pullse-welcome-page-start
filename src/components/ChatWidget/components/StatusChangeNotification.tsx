
import React, { useEffect, useState } from 'react';
import { AgentStatus } from '../types';
import StatusMessage from './StatusMessage';
import { differenceInSeconds } from 'date-fns';

interface StatusChangeNotificationProps {
  previousStatus?: AgentStatus;
  currentStatus: AgentStatus;
  agentName?: string;
  timestamp: Date;
  onClose?: () => void;
  autoHideDuration?: number; // in seconds
}

const StatusChangeNotification: React.FC<StatusChangeNotificationProps> = ({
  previousStatus,
  currentStatus,
  agentName = 'Agent',
  timestamp,
  onClose,
  autoHideDuration = 10 // 10 seconds default
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoHideDuration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, autoHideDuration * 1000);

      return () => clearTimeout(timer);
    }
  }, [autoHideDuration, onClose]);

  // If no previous status or notification is hidden, don't show anything
  if (!previousStatus || !visible) {
    return null;
  }

  // Generate appropriate message based on status change
  const getStatusChangeMessage = () => {
    // Special messages for specific transitions
    if (previousStatus === 'offline' && currentStatus === 'online') {
      return `${agentName} is now available`;
    }
    
    if (previousStatus !== 'offline' && currentStatus === 'offline') {
      return `${agentName} has gone offline`;
    }
    
    // Generic status change message
    return `${agentName} is now ${currentStatus}`;
  };

  // Check if notification is too old (more than 5 minutes)
  const isTooOld = () => {
    return differenceInSeconds(new Date(), timestamp) > 300; // 5 minutes
  };

  if (isTooOld()) {
    return null;
  }

  return (
    <StatusMessage 
      text={getStatusChangeMessage()}
      type="status-change"
      agentStatus={currentStatus}
      timestamp={timestamp}
    />
  );
};

export default StatusChangeNotification;
