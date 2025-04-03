
import { useState, useEffect } from 'react';
import { fetchChatWidgetConfig } from '../services/api';
import { ChatWidgetConfig, defaultConfig } from '../config';
import { getDefaultConfig } from '../embed/api';

export function useWidgetConfig(workspaceId?: string) {
  const [config, setConfig] = useState<ChatWidgetConfig>(defaultConfig);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

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
        if (import.meta.env.DEV || window.location.hostname.includes('lovableproject.com')) {
          console.log(`Using default config for workspace ${workspaceId} in development mode`);
          
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
        
        const fetchedConfig = await fetchChatWidgetConfig(workspaceId);
        setConfig(fetchedConfig);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch config'));
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
  }, [workspaceId]);

  return { config, loading, error };
}

export default useWidgetConfig;
