import { useState, useEffect } from 'react';
import { fetchChatWidgetConfig } from '../services/api';
import { ChatWidgetConfig, defaultConfig } from '../config';
import { logger } from '@/lib/logger';
import { getWorkspaceIdAndApiKey, getContactDetailsFromLocalStorage } from '../utils/storage';

export function useWidgetConfig() {
  const [config, setConfig] = useState<ChatWidgetConfig>(defaultConfig);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Get workspace id and api key from localStorage
  const { workspaceId, apiKey } = getWorkspaceIdAndApiKey();

  useEffect(() => {
    async function loadConfig() {
      if (!workspaceId) {
        setConfig(defaultConfig);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        logger.info(`Fetching config for workspace ${workspaceId}`, 'useWidgetConfig');
        
        const fetchedConfig = await fetchChatWidgetConfig(workspaceId, apiKey);
        
        // Check if we have contact details in localStorage to determine login state
        const contactDetails = getContactDetailsFromLocalStorage();
        
        logger.debug('Config fetched successfully', 'useWidgetConfig', {
          hasContacts: !!contactDetails,
          isLoggedIn: fetchedConfig.isLoggedIn
        });

        // Set whether the user is logged in based on the presence of contact details
        const finalConfig = {
          ...fetchedConfig,
          isLoggedIn: fetchedConfig.isLoggedIn || !!contactDetails
        };

        setConfig(finalConfig);
        setError(null);
      } catch (err) {
        const errorInstance = err instanceof Error ? err : new Error('Failed to fetch config');
        logger.error('Failed to fetch widget config', 'useWidgetConfig', errorInstance);

        setError(errorInstance);
        // Still use default config as fallback but keep the workspace ID
        setConfig({
          ...defaultConfig,
          workspaceId
        });
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, [workspaceId, apiKey]);

  return { config, loading, error };
}

export default useWidgetConfig;
