
import { useState, useEffect } from 'react';
import { fetchChatWidgetConfig } from '../services/api';
import { ChatWidgetConfig, defaultConfig } from '../config';
import { getDefaultConfig } from '../embed/api';
import { logger } from '@/lib/logger';
import { getWorkspaceIdAndApiKey } from '../utils/storage';

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

        // Log that we're in development mode
        // if (import.meta.env.DEV || window.location.hostname.includes('lovableproject.com')) {
        if (import.meta.env.DEV) {
          logger.debug(
            `Using default config for workspace ${workspaceId} in development mode`,
            'useWidgetConfig'
          );

          // Use the default config for development mode
          const devConfig = {
            ...defaultConfig,
            workspaceId,
            // Merge with our simple default config
            ...getDefaultConfig(workspaceId)
          };

          setConfig(devConfig);
          setError(null);
          return;
        }

        logger.info(`Fetching config for workspace ${workspaceId}`, 'useWidgetConfig');
        const fetchedConfig = await fetchChatWidgetConfig(workspaceId, apiKey);
        console.log(fetchedConfig)


        logger.debug('Config fetched successfully', 'useWidgetConfig', {
          hasRealtime: true,
          hasBranding: !!fetchedConfig.brandAssets
        });

        setConfig(fetchedConfig);
        setError(null);
      } catch (err) {
        const errorInstance = err instanceof Error ? err : new Error('Failed to fetch config');
        logger.error('Failed to fetch widget config', 'useWidgetConfig', errorInstance);

        setError(errorInstance);
        // Still use default config as fallback
        setConfig({
          ...defaultConfig,
          workspaceId,
          // Merge with our simple default config
          ...getDefaultConfig(workspaceId)
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
