
import { useMemo } from 'react';
import { Conversation } from '../types';
import { ChatWidgetConfig } from '../config';

export function useChatAvatars(conversation: Conversation, config?: ChatWidgetConfig) {
  // Get avatar URLs from config
  const agentAvatar = useMemo(() => 
    conversation.agentInfo?.avatar || config?.branding?.avatarUrl,
    [conversation.agentInfo?.avatar, config?.branding?.avatarUrl]
  );
  
  const userAvatar = undefined; // Could be set from user profile if available

  return {
    agentAvatar,
    userAvatar
  };
}
