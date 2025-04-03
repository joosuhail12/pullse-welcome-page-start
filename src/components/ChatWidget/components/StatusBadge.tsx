
import React from 'react';
import { AgentStatus } from '../types';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle2, Clock, AlertTriangle, MinusCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: AgentStatus;
  className?: string;
  showLabel?: boolean;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
  showLabel = true,
  showIcon = true,
  size = 'md'
}) => {
  // Status configuration
  const statusConfig = {
    online: {
      label: 'Online',
      icon: <CheckCircle2 size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />,
      classes: 'bg-green-100 text-green-800 border-green-200',
      dotColor: 'bg-green-500'
    },
    busy: {
      label: 'Busy',
      icon: <Clock size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />,
      classes: 'bg-amber-100 text-amber-800 border-amber-200',
      dotColor: 'bg-amber-500'
    },
    away: {
      label: 'Away',
      icon: <AlertTriangle size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />,
      classes: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      dotColor: 'bg-yellow-500'
    },
    offline: {
      label: 'Offline',
      icon: <MinusCircle size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />,
      classes: 'bg-gray-100 text-gray-800 border-gray-200',
      dotColor: 'bg-gray-500'
    }
  };

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-2.5 py-1 text-sm'
  };

  const config = statusConfig[status] || statusConfig.offline;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            className={`${config.classes} ${sizeClasses[size]} rounded-full font-medium border flex items-center gap-1.5 ${className}`} 
            variant="outline"
          >
            {showIcon && config.icon}
            {showLabel && <span>{config.label}</span>}
            {!showIcon && !showLabel && (
              <span className={`w-2 h-2 rounded-full ${config.dotColor} animate-pulse`}></span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top">
          <div className="flex flex-col gap-1">
            <p className="font-medium">Agent is {status}</p>
            {status === 'online' && <p className="text-xs">Ready to respond to your messages</p>}
            {status === 'busy' && <p className="text-xs">Currently handling other conversations</p>}
            {status === 'away' && <p className="text-xs">Temporarily unavailable</p>}
            {status === 'offline' && <p className="text-xs">Not available at the moment</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default StatusBadge;
