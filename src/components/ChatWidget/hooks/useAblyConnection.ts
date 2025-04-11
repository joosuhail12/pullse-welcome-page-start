
import { useEffect } from 'react';
import { ChatWidgetConfig } from '../config';
import { initializeAbly } from '../utils/ably/connection';
import { getAccessToken } from '../utils/storage';

export const useAblyConnection = (config: ChatWidgetConfig) => {
  useEffect(() => {
    const accessToken = getAccessToken();
    
    if (accessToken) {
      try {
        initializeAbly(config);
      } catch (error) {
        console.error('Failed to initialize Ably connection', error);
      }
    }
  }, [config]);
};
