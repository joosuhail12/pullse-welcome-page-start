
import { useState, useEffect, useRef } from 'react';
import { fetchChatWidgetConfig } from '../services/api';
import { ChatWidgetConfig, defaultConfig } from '../config';
import { logger } from '@/lib/logger';
import { getWorkspaceIdAndApiKey, getUserFormDataFromLocalStorage, setUserFormDataInLocalStorage, clearUserFormDataFromLocalStorage } from '../utils/storage';
import { setChatSessionId } from '../utils/storage';

// Create a global config cache to prevent multiple fetch calls
let globalConfigCache: ChatWidgetConfig | null = null;
let configFetchInProgress = false;
let lastFetchedWorkspaceId: string | null = null;

export function useWidgetConfig() {
  const [config, setConfig] = useState<ChatWidgetConfig>(globalConfigCache || defaultConfig);
  const [loading, setLoading] = useState<boolean>(!globalConfigCache);
  const [error, setError] = useState<Error | null>(null);
  const [contactData, setContactData] = useState<any>(null);
  const configFetchedRef = useRef<boolean>(!!globalConfigCache);

  const { workspaceId, apiKey } = getWorkspaceIdAndApiKey();

  useEffect(() => {
    async function loadConfig() {
      // If we already have a global cache for this workspace, use it and skip API call
      if (globalConfigCache && lastFetchedWorkspaceId === workspaceId) {
        logger.info('Using cached config, skipping API call', 'useWidgetConfig');
        setConfig(globalConfigCache);
        setLoading(false);

        // Set contact data from cache if available
        if (globalConfigCache.contact) {
          setContactData(globalConfigCache.contact);
        } else {
          // If the cached config doesn't have contact data, we should clear local storage form data
          clearUserFormDataFromLocalStorage();
          setContactData(null);
        }
        return;
      }

      if (!workspaceId) {
        setConfig(defaultConfig);
        setLoading(false);
        return;
      }

      // Skip fetching if we've already loaded the config once and it's for the same workspace
      if (configFetchedRef.current && lastFetchedWorkspaceId === workspaceId) {
        logger.info('Config already fetched for this workspace, skipping API call', 'useWidgetConfig');
        setLoading(false);
        return;
      }

      // Skip if another fetch is already in progress for this workspace
      if (configFetchInProgress && lastFetchedWorkspaceId === workspaceId) {
        logger.info('Config fetch already in progress, waiting for result', 'useWidgetConfig');
        return;
      }

      try {
        setLoading(true);
        configFetchInProgress = true;
        lastFetchedWorkspaceId = workspaceId;

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

        // Check if API response contains contact data
        if (fetchedConfig.contact) {
          setContactData(fetchedConfig.contact);

          const formData = {
            email: fetchedConfig.contact.email,
            name: `${fetchedConfig.contact.firstname} ${fetchedConfig.contact.lastname}`.trim()
          };

          setUserFormDataInLocalStorage(formData);
        } else {
          // If the API response doesn't have contact data, clear local storage
          clearUserFormDataFromLocalStorage();
          setContactData(null);
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
