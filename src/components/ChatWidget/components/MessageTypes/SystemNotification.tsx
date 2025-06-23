
import React from 'react';
import { Info, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface SystemNotificationProps {
  text: string;
  renderText?: (text: string) => React.ReactNode;
  className?: string;
  type?: 'info' | 'warning' | 'success' | 'error' | 'connection';
  timestamp?: Date;
}

const SystemNotification = ({ 
  text, 
  renderText, 
  className = '',
  type = 'info',
  timestamp
}: SystemNotificationProps) => {
  
  const getStatusIcon = () => {
    switch (type) {
      case 'info':
        return <Info size={14} className="mr-2 text-blue-500" />;
      case 'warning':
        return <AlertCircle size={14} className="mr-2 text-amber-500" />;
      case 'success':
        return <CheckCircle2 size={14} className="mr-2 text-green-500" />;
      case 'error':
        return <AlertCircle size={14} className="mr-2 text-red-500" />;
      case 'connection':
        return <Clock size={14} className="mr-2 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`text-sm text-gray-800 leading-relaxed ${className}`}>
      <div className="flex items-center">
        {getStatusIcon()}
        <span>{renderText ? renderText(text) : text}</span>
        {timestamp && (
          <span className="ml-2 text-xs text-gray-500">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
};

export default SystemNotification;
