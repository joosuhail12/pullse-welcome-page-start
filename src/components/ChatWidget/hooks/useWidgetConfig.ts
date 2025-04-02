
import { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchChatWidgetConfig, invalidateConfigCache } from '../services/api';
import { ChatWidgetConfig, defaultConfig } from '../config';

export function useWidgetConfig(workspaceId?: string) {
  const [config, setConfig] = useState<ChatWidgetConfig>(defaultConfig);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Memoize the workspaceId to avoid unnecessary effect triggers
  const memoizedWorkspaceId = useMemo(() => workspaceId, [workspaceId]);

  // Memoize the loadConfig function
  const loadConfig = useCallback(async () => {
    if (!memoizedWorkspaceId) {
      setConfig(defaultConfig);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const fetchedConfig = await fetchChatWidgetConfig(memoizedWorkspaceId);
      setConfig(fetchedConfig);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch config'));
      // Still use default config as fallback
      setConfig(defaultConfig);
    } finally {
      setLoading(false);
    }
  }, [memoizedWorkspaceId]);
  
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);
  
  // Memoize the refreshConfig function to prevent unnecessary recreations
  const refreshConfig = useCallback(async () => {
    if (!memoizedWorkspaceId) return;
    
    // Invalidate the config cache
    invalidateConfigCache(memoizedWorkspaceId);
    
    // Set loading state
    setLoading(true);
    
    try {
      // Fetch fresh config
      const freshConfig = await fetchChatWidgetConfig(memoizedWorkspaceId);
      setConfig(freshConfig);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh config'));
    } finally {
      setLoading(false);
    }
  }, [memoizedWorkspaceId]);

  // Memoize the return value to prevent unnecessary re-renders
  const returnValue = useMemo(() => ({
    config,
    loading,
    error,
    refreshConfig
  }), [config, loading, error, refreshConfig]);

  return returnValue;
}

export default useWidgetConfig;
