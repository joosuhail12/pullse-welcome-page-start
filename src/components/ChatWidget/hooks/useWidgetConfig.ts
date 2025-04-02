
import { useState, useEffect } from 'react';
import { fetchChatWidgetConfig } from '../services/api';
import { ChatWidgetConfig, defaultConfig } from '../config';

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
        const fetchedConfig = await fetchChatWidgetConfig(workspaceId);
        setConfig(fetchedConfig);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch config'));
        // Still use default config as fallback
        setConfig(defaultConfig);
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, [workspaceId]);

  return { config, loading, error };
}

export default useWidgetConfig;
