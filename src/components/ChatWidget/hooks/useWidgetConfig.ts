
import { useState, useEffect, useRef } from 'react';
import { fetchChatWidgetConfig } from '../services/api';
import { ChatWidgetConfig, defaultConfig } from '../config';
import { logger } from '@/lib/logger';
import { getWorkspaceIdAndApiKey, getUserFormDataFromLocalStorage, setUserFormDataInLocalStorage } from '../utils/storage';
import { setChatSessionId } from '../utils/storage';

// Create a global config cache to prevent multiple fetch calls
let globalConfigCache: ChatWidgetConfig | null = null;
let configFetchInProgress = false;

export function useWidgetConfig() {
  const [config, setConfig] = useState<ChatWidgetConfig>(globalConfigCache || defaultConfig);
  const [loading, setLoading] = useState<boolean>(!globalConfigCache);
  const [error, setError] = useState<Error | null>(null);
  const [contactData, setContactData] = useState<any>(null);
  const configFetchedRef = useRef<boolean>(!!globalConfigCache);

  const { workspaceId } = getWorkspaceIdAndApiKey();

  useEffect(() => {
    async function loadConfig() {
      // If we already have a global cache, use it and skip API call
      if (globalConfigCache) {
        logger.info('Using cached config, skipping API call', 'useWidgetConfig');
        setConfig(globalConfigCache);
        setLoading(false);
        
        // Set contact data from cache if available
        if (globalConfigCache.contact) {
          setContactData(globalConfigCache.contact);
        } else {
          const storedUserData = getUserFormDataFromLocalStorage();
          if (storedUserData) {
            setContactData(storedUserData);
          }
        }
        return;
      }

      if (!workspaceId) {
        setConfig(defaultConfig);
        setLoading(false);
        return;
      }

      // Skip fetching if we've already loaded the config once
      if (configFetchedRef.current) {
        logger.info('Config already fetched, skipping API call', 'useWidgetConfig');
        setLoading(false);
        return;
      }

      // Skip if another fetch is already in progress
      if (configFetchInProgress) {
        logger.info('Config fetch already in progress, waiting for result', 'useWidgetConfig');
        return;
      }

      try {
        setLoading(true);
        configFetchInProgress = true;

        const apiKey = "85c7756b-f333-4ec9-a440-c4d1850482c3";

        logger.info(`Fetching config for workspace ${workspaceId}`, 'useWidgetConfig');
        const fetchedConfig = await fetchChatWidgetConfig(workspaceId, apiKey);

        logger.debug('Config fetched successfully', 'useWidgetConfig', {
          hasRealtime: !!fetchedConfig.realtime,
          hasBranding: !!fetchedConfig.brandAssets
        });

        // Mark that we've fetched the config
        configFetchedRef.current = true;
        
        // Store in global cache
        globalConfigCache = fetchedConfig;

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
        configFetchInProgress = false;
      }
    }

    loadConfig();
  }, [workspaceId]);

  return { config, loading, error, contactData };
}

export default useWidgetConfig;
