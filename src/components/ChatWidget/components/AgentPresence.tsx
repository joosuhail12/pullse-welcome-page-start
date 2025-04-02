
import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Agent {
  id: string;
  name: string;
  avatar?: string;
}

// This is a mock implementation. In a real app, you would use Ably SDK
const useAgentPresence = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  
  useEffect(() => {
    // Mock data - in real implementation, this would be replaced with Ably subscription
    const mockAgents = [
      { id: '1', name: 'John Doe', avatar: '/placeholder.svg' },
      { id: '2', name: 'Jane Smith', avatar: '/placeholder.svg' },
      { id: '3', name: 'Alex Johnson', avatar: '/placeholder.svg' },
    ];
    
    setAgents(mockAgents);
    
    // Return cleanup function
    return () => {
      // Cleanup Ably subscription in real implementation
    };
  }, []);
  
  return { agents };
};

const AgentPresence: React.FC = () => {
  const { agents } = useAgentPresence();
  const maxDisplayed = 5;
  
  if (agents.length === 0) {
    return null;
  }
  
  return (
    <div className="flex items-center mt-2">
      <span className="text-xs text-gray-500 mr-2">Online:</span>
      <div className="flex -space-x-2">
        <TooltipProvider>
          {agents.slice(0, maxDisplayed).map((agent) => (
            <Tooltip key={agent.id}>
              <TooltipTrigger asChild>
                <Avatar className="h-6 w-6 border-2 border-white">
                  <AvatarImage src={agent.avatar} />
                  <AvatarFallback className="text-[10px] bg-vivid-purple text-white">
                    {agent.name.split(' ').map(part => part[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="bottom">
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
