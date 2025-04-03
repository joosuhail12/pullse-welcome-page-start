
import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Agent } from '../types';
import { getPresence, subscribeToPresence } from '../utils/ably';
import { useWidgetConfig } from '../hooks/useWidgetConfig';

interface AgentPresenceProps {
  workspaceId?: string;
}

const AgentPresence: React.FC<AgentPresenceProps> = ({ workspaceId }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const { config } = useWidgetConfig(workspaceId);
  const maxDisplayed = 5;
  
  useEffect(() => {
    if (!workspaceId || !config.realtime?.enabled) {
      // Use mock data when real-time is disabled
      const mockAgents = [
        { id: '1', name: 'John Doe', avatar: '/placeholder.svg', status: 'online' as const },
        { id: '2', name: 'Jane Smith', avatar: '/placeholder.svg', status: 'online' as const },
        { id: '3', name: 'Alex Johnson', avatar: '/placeholder.svg', status: 'online' as const },
      ];
      
      setAgents(mockAgents);
      return;
    }
    
    // Channel for workspace-level presence with proper scoping
    const channelName = `workspace:${workspaceId}:presence`;

    // Fetch initial presence
    const fetchInitialPresence = async () => {
      try {
        const presenceData = await getPresence(channelName);
        const agentData: Agent[] = presenceData.map(member => ({
          id: member.clientId,
          name: member.data?.name || 'Agent',
          avatar: member.data?.avatar,
          status: 'online'
        }));
        
        setAgents(agentData);
      } catch (error) {
        console.error('Error fetching initial presence:', error);
      }
    };
    
    fetchInitialPresence();
    
    // Subscribe to presence updates
    subscribeToPresence(channelName, (presenceData) => {
      const agentData: Agent[] = presenceData.map(member => ({
        id: member.clientId,
        name: member.data?.name || 'Agent',
        avatar: member.data?.avatar,
        status: 'online'
      }));
      
      setAgents(agentData);
    });
    
    // Return cleanup function
    return () => {
      // Cleanup will be handled by the cleanupAbly function
    };
  }, [workspaceId, config.realtime?.enabled]);
  
  if (agents.length === 0) {
    return null;
  }
  
  return (
    <div className="flex items-center mt-2">
      <span className="text-xs text-gray-100 mr-2 opacity-80">Online:</span>
      <div className="flex -space-x-2">
        <TooltipProvider>
          {agents.slice(0, maxDisplayed).map((agent) => (
            <Tooltip key={agent.id}>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Avatar className="h-6 w-6 border-2 border-white">
                    <AvatarImage src={agent.avatar} />
                    <AvatarFallback className="text-[10px] bg-vivid-purple text-white">
                      {agent.name.split(' ').map(part => part[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Pulsing dot for online status */}
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border border-white">
                    <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></span>
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                <p>{agent.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
        
        {agents.length > maxDisplayed && (
          <Avatar className="h-6 w-6 border-2 border-white">
            <AvatarFallback className="text-[10px] bg-gray-500 text-white">
              +{agents.length - maxDisplayed}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
};

export default AgentPresence;
