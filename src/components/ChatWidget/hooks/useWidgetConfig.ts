
import { useState, useEffect, useMemo } from 'react';
import { ChatWidgetConfig, defaultConfig } from '../config';
import { fetchChatWidgetConfig } from '../services/configApi';

export const useWidgetConfig = (workspaceId: string, initialConfig?: Partial<ChatWidgetConfig>) => {
  const [config, setConfig] = useState<ChatWidgetConfig>({
    ...defaultConfig,
    ...initialConfig,
    workspaceId
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch configuration from API
  useEffect(() => {
    const getConfig = async () => {
      try {
        setLoading(true);
        const apiConfig = await fetchChatWidgetConfig(workspaceId);
        
        // Merge API config with initial config (initial config takes precedence)
        setConfig(currentConfig => ({
          ...defaultConfig,
          ...apiConfig,
          ...initialConfig,
          workspaceId
        }));
        
        setError(null);
      } catch (err: any) {
        setError(err instanceof Error ? err : new Error('Failed to load configuration'));
        // Still use default/initial config on error
      } finally {
        setLoading(false);
      }
    };
    
    getConfig();
  }, [workspaceId, initialConfig]);
  
  // Create a derived, normalized config with defaults for any missing properties
  const mergedConfig = useMemo(() => {
    return {
      ...config,
      preChatForm: config.preChatForm || defaultConfig.preChatForm,
      features: { ...defaultConfig.features, ...config.features },
      realtime: { ...defaultConfig.realtime, ...config.realtime },
      sessionId: config.sessionId || undefined
    };
  }, [config]);
  
  return {
    config: mergedConfig,
    loading,
    error,
    setConfig
  };
};

export default useWidgetConfig; // Add default export for backward compatibility
