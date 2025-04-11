
import { useState, useEffect } from 'react';
import { fetchChatWidgetConfig } from '../services/api';
import { ChatWidgetConfig, defaultConfig } from '../config';
import { logger } from '@/lib/logger';
import { getWorkspaceIdAndApiKey, getUserFormDataFromLocalStorage, setUserFormDataInLocalStorage } from '../utils/storage';
import { setChatSessionId } from '../utils/storage';

export function useWidgetConfig() {
  const [config, setConfig] = useState<ChatWidgetConfig>(defaultConfig);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [contactData, setContactData] = useState<any>(null);

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

        const apiKey = "85c7756b-f333-4ec9-a440-c4d1850482c3";

        logger.info(`Fetching config for workspace ${workspaceId}`, 'useWidgetConfig');
        const fetchedConfig = await fetchChatWidgetConfig(workspaceId, apiKey);

        logger.debug('Config fetched successfully', 'useWidgetConfig', {
          hasRealtime: !!fetchedConfig.realtime,
          hasBranding: !!fetchedConfig.brandAssets
        });

        if (fetchedConfig.contact) {
          setContactData(fetchedConfig.contact);
          
          const formData = {
            email: fetchedConfig.contact.email,
            name: `${fetchedConfig.contact.firstname} ${fetchedConfig.contact.lastname}`.trim()
          };
          
          setUserFormDataInLocalStorage(formData);
        } else {
          const storedUserData = getUserFormDataFromLocalStorage();
          if (storedUserData) {
            setContactData(storedUserData);
          }
        }

        // Store the session ID if it exists in the response
        if (fetchedConfig.sessionId) {
          setChatSessionId(fetchedConfig.sessionId);
        }

        setConfig(fetchedConfig);
        setError(null);
      } catch (err) {
        const errorInstance = err instanceof Error ? err : new Error('Failed to fetch config');
        logger.error('Failed to fetch widget config', 'useWidgetConfig', errorInstance);

        setError(errorInstance);
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
