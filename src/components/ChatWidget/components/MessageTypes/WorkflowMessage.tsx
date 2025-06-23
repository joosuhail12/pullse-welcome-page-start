
import React from 'react';
import { Workflow, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

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
        return <AlertCircle size={14} className="text-red-500" />;
      default:
        return <Workflow size={14} className="text-purple-500" />;
    }
  };

  return (
    <div className={`text-sm text-gray-800 leading-relaxed ${className}`}>
      <div className="flex items-center gap-2 mb-2 text-purple-600">
        <Workflow size={14} />
        <span className="text-xs font-medium">{workflowName}</span>
        {getStatusIcon()}
        <span className="text-xs capitalize">• {status}</span>
      </div>
      {renderText ? renderText(text) : text}
    </div>
  );
};

export default WorkflowMessage;
