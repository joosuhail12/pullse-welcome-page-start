
import React from 'react';
import { Workflow, Zap, CheckCircle2 } from 'lucide-react';

interface WorkflowMessageProps {
  text: string;
  renderText?: (text: string) => React.ReactNode;
  className?: string;
  timestamp?: Date;
  workflowName?: string;
  status?: 'running' | 'completed' | 'failed';
}

const WorkflowMessage = ({ 
  text, 
  renderText, 
  className = '',
  timestamp,
  workflowName = 'Automation',
  status = 'completed'
}: WorkflowMessageProps) => {
  
  const getStatusIcon = () => {
    switch (status) {
      case 'running':
        return <Zap size={14} className="text-amber-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle2 size={14} className="text-green-500" />;
      case 'failed':
        return <Workflow size={14} className="text-red-500" />;
      default:
        return <Workflow size={14} className="text-purple-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return 'from-amber-50 to-orange-50 border-amber-200/60';
      case 'completed':
        return 'from-green-50 to-emerald-50 border-green-200/60';
      case 'failed':
        return 'from-red-50 to-pink-50 border-red-200/60';
      default:
        return 'from-purple-50 to-indigo-50 border-purple-200/60';
    }
  };

  return (
    <div className={`flex items-start gap-3 p-4 bg-gradient-to-br ${getStatusColor()} rounded-2xl border shadow-sm max-w-[90%] mx-auto ${className}`}>
      {/* Workflow Avatar */}
      <div className="flex-shrink-0 relative">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
          <Workflow size={18} className="text-white" />
        </div>
        <div className="absolute -top-1 -right-1">
          {getStatusIcon()}
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-purple-700">{workflowName}</span>
          <span className="text-xs text-purple-600/70 capitalize">• {status}</span>
        </div>
        
        <div className="text-sm text-gray-800 leading-relaxed">
          {renderText ? renderText(text) : text}
        </div>
        
        {timestamp && (
          <div className="mt-2 text-xs text-purple-600/70">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowMessage;
