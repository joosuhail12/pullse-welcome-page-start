
import { useState, useEffect } from 'react';
import { fetchChatWidgetConfig } from '../services/api';
import { ChatWidgetConfig, defaultConfig } from '../config';
import { getDefaultConfig } from '../embed/api';
import { logger } from '@/lib/logger';

export function useWidgetConfig(workspaceId?: string) {
  const [config, setConfig] = useState<ChatWidgetConfig>(defaultConfig);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Apply brand colors to document root for CSS variable usage
  useEffect(() => {
    if (config.branding?.primaryColor) {
      // Create a style element to apply the brand colors
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        :root {
          --vivid-purple: ${config.branding.primaryColor};
          --chat-header-bg: ${config.branding.primaryColor};
          --user-bubble-bg: ${config.branding.primaryColor};
          --system-bubble-bg: #F8F7FF;
          --system-bubble-text: #1f2937;
        }
      `;
      
      document.head.appendChild(styleElement);
      
      return () => {
        document.head.removeChild(styleElement);
      };
    }
  }, [config.branding?.primaryColor]);

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
        const fetchedConfig = await fetchChatWidgetConfig(workspaceId);
        
        logger.debug('Config fetched successfully', 'useWidgetConfig', {
          hasRealtime: !!fetchedConfig.realtime,
          hasBranding: !!fetchedConfig.branding
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
  }, [workspaceId]);

  return { config, loading, error };
}

export default useWidgetConfig;
