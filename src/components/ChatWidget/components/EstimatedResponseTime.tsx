
import React from 'react';
import { AgentStatus } from '../types';
import { Clock, ClockIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EstimatedResponseTimeProps {
  agentStatus?: AgentStatus;
  customTime?: string;
  className?: string;
}

const EstimatedResponseTime: React.FC<EstimatedResponseTimeProps> = ({
  agentStatus = 'offline',
  customTime,
  className = ''
}) => {
  // Define estimated times based on agent status
  const getEstimatedTime = () => {
    if (customTime) return customTime;
    
    switch (agentStatus) {
      case 'online':
        return '< 5 minutes';
      case 'busy':
        return '15-30 minutes';
      case 'away':
        return '1-2 hours';
      case 'offline':
        return '24 hours';
      default:
        return 'Unknown';
    }
  };
  
  // Get appropriate styling based on agent status
  const getStatusColor = () => {
    switch (agentStatus) {
      case 'online':
        return 'text-green-600 bg-green-50';
      case 'busy':
        return 'text-amber-600 bg-amber-50';
      case 'away':
        return 'text-yellow-600 bg-yellow-50';
      case 'offline':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center text-xs px-2 py-1 rounded ${getStatusColor()} ${className}`}>
            <Clock size={12} className="mr-1.5" />
            <span>Est. Response: {getEstimatedTime()}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <p>Estimated response time based on agent availability</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default EstimatedResponseTime;
