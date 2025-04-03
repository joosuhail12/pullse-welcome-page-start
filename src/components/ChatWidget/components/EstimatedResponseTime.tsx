
import React from 'react';
import { AgentStatus } from '../types';
import { Clock } from 'lucide-react';
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
        return 'text-green-700 bg-green-50 border border-green-100';
      case 'busy':
        return 'text-amber-700 bg-amber-50 border border-amber-100';
      case 'away':
        return 'text-yellow-700 bg-yellow-50 border border-yellow-100';
      case 'offline':
        return 'text-gray-700 bg-gray-50 border border-gray-100';
      default:
        return 'text-gray-700 bg-gray-50 border border-gray-100';
    }
  };

  const getTooltipMessage = () => {
    switch (agentStatus) {
      case 'online':
        return 'Agent is online and ready to respond quickly';
      case 'busy':
        return 'Agent is currently busy with other conversations';
      case 'away':
        return 'Agent is away from their desk';
      case 'offline':
        return 'No agents are currently online';
      default:
        return 'Estimated response time based on agent availability';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`inline-flex items-center text-xs px-3 py-1.5 rounded-full font-medium shadow-sm ${getStatusColor()} ${className} transition-all duration-300 hover:shadow`}
            role="status"
            aria-label={`Estimated response time: ${getEstimatedTime()}`}
          >
            <Clock size={12} className="mr-1.5 animate-pulse" />
            <span>Est. Response: {getEstimatedTime()}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs bg-white border border-gray-200 shadow-md">
          <p>{getTooltipMessage()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default EstimatedResponseTime;
