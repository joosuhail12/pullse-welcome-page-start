
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
}

const TicketProgressBar: React.FC<TicketProgressBarProps> = ({ status, className }) => {
  // Define the steps and their progress values
  const statusSteps: Record<TicketStatus, StatusStep> = {
    'new': { 
      label: 'New', 
      value: 10, 
      description: 'Ticket has been created and is awaiting review',
      color: 'bg-blue-500'
    },
    'in-progress': { 
      label: 'In Progress', 
      value: 40, 
      description: 'An agent is actively working on your request',
      color: 'bg-yellow-500' 
    },
    'pending': { 
      label: 'Pending', 
      value: 70, 
      description: 'Waiting for additional information or action',
      color: 'bg-amber-500' 
    },
    'resolved': { 
      label: 'Resolved', 
      value: 90, 
      description: 'Your request has been resolved',
      color: 'bg-green-500' 
    },
    'closed': { 
      label: 'Closed', 
      value: 100, 
      description: 'This ticket is now closed',
      color: 'bg-gray-500' 
    }
  };

  const currentStatus = statusSteps[status];

  return (
    <div className={`w-full px-3 pt-1 pb-2 ${className}`}>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Ticket Status</span>
        <span className="font-medium text-vivid-purple">{currentStatus.label}</span>
      </div>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative w-full">
            <Progress 
              value={currentStatus.value} 
              className={`h-1.5 ${currentStatus.color}`}
            />
            
            {/* Status markers */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500" />
            <div className={`absolute top-1/2 left-1/3 -translate-y-1/2 w-2 h-2 rounded-full ${status === 'new' ? 'bg-gray-300' : 'bg-yellow-500'}`} />
            <div className={`absolute top-1/2 left-2/3 -translate-y-1/2 w-2 h-2 rounded-full ${['new', 'in-progress'].includes(status) ? 'bg-gray-300' : 'bg-amber-500'}`} />
            <div className={`absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 rounded-full ${['new', 'in-progress', 'pending'].includes(status) ? 'bg-gray-300' : 'bg-green-500'}`} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{currentStatus.description}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default TicketProgressBar;
