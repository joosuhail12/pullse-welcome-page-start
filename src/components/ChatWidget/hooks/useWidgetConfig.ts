
import { useState, useEffect } from 'react';
import { fetchChatWidgetConfig } from '../services/api';
import { ChatWidgetConfig, defaultConfig } from '../config';
import { logger } from '@/lib/logger';
import { getWorkspaceIdAndApiKey, getUserFormDataFromLocalStorage } from '../utils/storage';

export function useWidgetConfig() {
  const [config, setConfig] = useState<ChatWidgetConfig>(defaultConfig);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [contactData, setContactData] = useState<any>(null);

  // Get workspace id and api key from localStorage
  const { workspaceId } = getWorkspaceIdAndApiKey();

  useEffect(() => {
    async function loadConfig() {
      if (!workspaceId) {
        setConfig(defaultConfig);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Use hardcoded API key instead of relying on localStorage
        const apiKey = "85c7756b-f333-4ec9-a440-c4d1850482c3";

        logger.info(`Fetching config for workspace ${workspaceId}`, 'useWidgetConfig');
        const fetchedConfig = await fetchChatWidgetConfig(workspaceId, apiKey);

        logger.debug('Config fetched successfully', 'useWidgetConfig', {
          hasRealtime: true,
          hasBranding: !!fetchedConfig.brandAssets
        });

        // Check if contact data exists in the API response
        if (fetchedConfig.contact) {
          // Store contact data in state
          setContactData(fetchedConfig.contact);
          
          // Create user form data based on contact information
          const formData = {
            email: fetchedConfig.contact.email,
            name: `${fetchedConfig.contact.firstname} ${fetchedConfig.contact.lastname}`.trim()
          };
          
          // Store this in local storage for subsequent widget loads
          localStorage.setItem('pullse_user_form_data', JSON.stringify(formData));
        } else {
          // Check if we have previously stored user data
          const storedUserData = getUserFormDataFromLocalStorage();
          if (storedUserData) {
            setContactData(storedUserData);
          }
        }

        setConfig(fetchedConfig);
        setError(null);
      } catch (err) {
        const errorInstance = err instanceof Error ? err : new Error('Failed to fetch config');
        logger.error('Failed to fetch widget config', 'useWidgetConfig', errorInstance);

        setError(errorInstance);
        // Use default config as fallback
        setConfig(defaultConfig);
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, [workspaceId]);

  return { config, loading, error, contactData };
}

export default useWidgetConfig;
