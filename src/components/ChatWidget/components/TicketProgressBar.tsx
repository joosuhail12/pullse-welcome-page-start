
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, Clock, AlertCircle, PauseCircle, XCircle } from 'lucide-react';

export type TicketStatus = 'new' | 'in-progress' | 'pending' | 'resolved' | 'closed';

interface TicketProgressBarProps {
  status: TicketStatus;
  className?: string;
}

interface StatusStep {
  label: string;
  value: number;
  description: string;
  color: string;
  icon: React.ReactNode;
}

const TicketProgressBar: React.FC<TicketProgressBarProps> = ({ status, className }) => {
  // Define the steps and their progress values with enhanced styling
  const statusSteps: Record<TicketStatus, StatusStep> = {
    'new': { 
      label: 'New', 
      value: 10, 
      description: 'Ticket has been created and is awaiting review',
      color: 'bg-blue-500',
      icon: <AlertCircle className="h-3 w-3" />
    },
    'in-progress': { 
      label: 'In Progress', 
      value: 40, 
      description: 'An agent is actively working on your request',
      color: 'bg-amber-500',
      icon: <Clock className="h-3 w-3" />
    },
    'pending': { 
      label: 'Pending', 
      value: 70, 
      description: 'Waiting for additional information or action',
      color: 'bg-orange-500',
      icon: <PauseCircle className="h-3 w-3" /> 
    },
    'resolved': { 
      label: 'Resolved', 
      value: 90, 
      description: 'Your request has been resolved',
      color: 'bg-green-500',
      icon: <Check className="h-3 w-3" /> 
    },
    'closed': { 
      label: 'Closed', 
      value: 100, 
      description: 'This ticket is now closed',
      color: 'bg-gray-500',
      icon: <XCircle className="h-3 w-3" /> 
    }
  };

  const currentStatus = statusSteps[status];

  return (
    <div className={`w-full px-4 pt-1 pb-2 transition-all duration-300 ${className}`}>
      <div className="flex justify-between items-center text-xs mb-2">
        <span className="font-medium text-white/90">Ticket Status</span>
        <span className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5 text-white font-medium">
          {currentStatus.icon}
          {currentStatus.label}
        </span>
      </div>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative w-full">
            {/* Enhanced progress bar with better contrast */}
            <Progress 
              value={currentStatus.value} 
              className={`h-2 bg-black/20 ${currentStatus.color}`}
            />
            
            {/* Status markers with enhanced visibility */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-blue-500 transform -translate-x-0.5" />
            <div className={`absolute top-1/2 left-1/3 -translate-y-1/2 w-3 h-3 rounded-full border-2 
              ${status === 'new' ? 'bg-white/50 border-gray-400' : 'bg-white border-amber-500'}`} />
            <div className={`absolute top-1/2 left-2/3 -translate-y-1/2 w-3 h-3 rounded-full border-2
              ${['new', 'in-progress'].includes(status) ? 'bg-white/50 border-gray-400' : 'bg-white border-orange-500'}`} />
            <div className={`absolute top-1/2 right-0 -translate-y-1/2 w-3 h-3 rounded-full border-2 transform translate-x-0.5
              ${['new', 'in-progress', 'pending'].includes(status) ? 'bg-white/50 border-gray-400' : 'bg-white border-green-500'}`} />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-gray-900 text-white">
          <p className="text-sm">{currentStatus.description}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default TicketProgressBar;
