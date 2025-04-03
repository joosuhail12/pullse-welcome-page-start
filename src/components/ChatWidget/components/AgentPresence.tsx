
import React from 'react';

interface AgentPresenceProps {
  workspaceId: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  agentName?: string;
}

const AgentPresence: React.FC<AgentPresenceProps> = ({ 
  workspaceId,
  status = 'offline',
  agentName
}) => {
  // Status indicator colors and text
  const statusConfig = {
    online: { color: 'bg-green-500', text: 'Online' },
    offline: { color: 'bg-gray-400', text: 'Offline' },
    away: { color: 'bg-yellow-500', text: 'Away' },
    busy: { color: 'bg-red-500', text: 'Busy' }
  };
  
  const { color, text } = statusConfig[status];
  
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className={`${color} w-1.5 h-1.5 rounded-full inline-block`}></span>
      <span>
        {agentName ? `${agentName} · ${text}` : text}
      </span>
    </div>
  );
};

export default AgentPresence;
