
import React from 'react';
import { AgentStatus } from '../types';
import { Clock, AlertCircle, CheckCircle2, Info, Sparkles } from 'lucide-react';

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
        return <Info size={16} className="mr-2 text-blue-500 animate-pulse" />;
      case 'warning':
        return <AlertCircle size={16} className="mr-2 text-amber-500" />;
      case 'success':
        return <CheckCircle2 size={16} className="mr-2 text-green-500" />;
      case 'error':
        return <AlertCircle size={16} className="mr-2 text-red-500" />;
      case 'status-change':
        return <Sparkles size={16} className="mr-2 text-purple-500 animate-pulse" />;
      default:
        return <Clock size={16} className="mr-2 text-gray-400" />;
    }
  };
  
  const getStatusStyles = () => {
    switch (type) {
      case 'info':
        return 'bg-gradient-to-r from-blue-50 to-blue-100/50 border-blue-200/70 text-blue-800 shadow-blue-100/50';
      case 'warning':
        return 'bg-gradient-to-r from-amber-50 to-yellow-100/50 border-amber-200/70 text-amber-800 shadow-amber-100/50';
      case 'success':
        return 'bg-gradient-to-r from-green-50 to-emerald-100/50 border-green-200/70 text-green-800 shadow-green-100/50';
      case 'error':
        return 'bg-gradient-to-r from-red-50 to-rose-100/50 border-red-200/70 text-red-800 shadow-red-100/50';
      case 'status-change':
        return 'bg-gradient-to-r from-purple-50 to-indigo-100/50 border-purple-200/70 text-purple-800 shadow-purple-100/50';
      default:
        return 'bg-gradient-to-r from-gray-50 to-slate-100/50 border-gray-200/70 text-gray-700 shadow-gray-100/50';
    }
  };

  return (
    <div className="flex justify-center my-3 px-4">
      <div 
        className={`
          inline-flex items-center px-4 py-2.5 rounded-full text-sm font-medium 
          border backdrop-blur-sm shadow-lg transition-all duration-300 
          hover:scale-105 hover:shadow-xl transform
          ${getStatusStyles()} 
          ${className}
        `}
      >
        {getStatusIcon()}
        
        <span className="flex-1">
          {renderText ? renderText(text) : text}
        </span>
        
        {timestamp && (
          <span className="ml-3 text-xs opacity-70 font-normal bg-white/20 px-2 py-0.5 rounded-full">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
        
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

export default StatusMessage;
