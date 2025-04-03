
import React from 'react';
import { AgentStatus } from '../types';
import { Clock, AlertCircle, CheckCircle2, Info } from 'lucide-react';

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
  
  const getStatusIcon = () => {
    switch (type) {
      case 'info':
        return <Info size={14} className="mr-1.5 text-blue-600" />;
      case 'warning':
        return <AlertCircle size={14} className="mr-1.5 text-amber-600" />;
      case 'success':
        return <CheckCircle2 size={14} className="mr-1.5 text-green-600" />;
      case 'error':
        return <AlertCircle size={14} className="mr-1.5 text-red-600" />;
      case 'status-change':
        return <Clock size={14} className="mr-1.5 text-purple-600" />;
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
      case 'status-change':
        return 'bg-purple-50 border-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 border-gray-200 text-gray-700';
    }
  };

  return (
    <div className={`py-2 px-5 rounded-full text-xs font-medium my-3 text-center shadow-sm border flex items-center justify-center max-w-[80%] mx-auto animate-subtle-fade-in ${getStatusColor()} ${className}`}>
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

export default StatusMessage;
