
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
        return <Info size={14} className="mr-1.5 text-blue-500" />;
      case 'warning':
        return <AlertCircle size={14} className="mr-1.5 text-amber-500" />;
      case 'success':
        return <CheckCircle2 size={14} className="mr-1.5 text-green-500" />;
      case 'error':
        return <AlertCircle size={14} className="mr-1.5 text-red-500" />;
      case 'connection':
        return <Clock size={14} className="mr-1.5 text-gray-500" />;
      default:
        return null;
    }
  };
  
  const getStatusColor = () => {
    switch (type) {
      case 'info':
        return 'bg-blue-50 border-blue-100 text-blue-700';
      case 'warning':
        return 'bg-amber-50 border-amber-100 text-amber-700';
      case 'success':
        return 'bg-green-50 border-green-100 text-green-700';
      case 'error':
        return 'bg-red-50 border-red-100 text-red-700';
      case 'connection':
        return 'bg-gray-50 border-gray-100 text-gray-600';
      default:
        return 'bg-gray-100/80 border-gray-100 text-gray-500';
    }
  };

  return (
    <div className={`py-1.5 px-5 rounded-full text-xs font-medium text-center shadow-sm border flex items-center justify-center max-w-[80%] mx-auto ${getStatusColor()} ${className}`}>
      {getStatusIcon()}
      <span>{renderText ? renderText(text) : text}</span>
      {timestamp && (
        <span className="ml-2 text-[10px] opacity-75">
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  );
};

export default SystemNotification;
