
import { useState, useEffect } from 'react';
import { fetchChatWidgetConfig } from '../services/api';
import { ChatWidgetConfig, defaultConfig } from '../config';
import { getDefaultConfig } from '../embed/api';
import { logger } from '@/lib/logger';
import { isValidChatPosition } from '../embed/core/optionsValidator';
import { ChatPositionString } from '../types';

/**
 * Helper function to ensure the returned value is a valid ChatPositionString
 * This adds type safety by ensuring we only return valid position values
 */
function ensureValidPosition(position: unknown): ChatPositionString {
  if (typeof position === 'string' && isValidChatPosition(position)) {
    return position;
  }
  return 'bottom-right';
}

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
        
        // Development mode handling
        if (import.meta.env.DEV || window.location.hostname.includes('lovableproject.com')) {
          logger.debug(
            `Using default config for workspace ${workspaceId} in development mode`, 
            'useWidgetConfig'
          );
          
          // Get the default placement value and ensure it's valid
          const defaultPlacementValue = defaultConfig.position?.placement || 'bottom-right';
          const validatedPlacement: ChatPositionString = ensureValidPosition(defaultPlacementValue);
          
          const devConfig: ChatWidgetConfig = {
            ...defaultConfig,
            workspaceId,
            position: {
              ...defaultConfig.position,
              placement: validatedPlacement
            },
            ...getDefaultConfig(workspaceId)
          };
          
          setConfig(devConfig);
          setError(null);
          return;
        }
        
        // Production mode handling
        logger.info(`Fetching config for workspace ${workspaceId}`, 'useWidgetConfig');
        const fetchedConfig = await fetchChatWidgetConfig(workspaceId);
        
        logger.debug('Config fetched successfully', 'useWidgetConfig', {
          hasRealtime: !!fetchedConfig.realtime,
          hasBranding: !!fetchedConfig.branding
        });
        
        // Get the fetched placement value and ensure it's valid
        const fetchedPlacementValue = fetchedConfig.position?.placement || 'bottom-right';
        const validatedPlacement: ChatPositionString = ensureValidPosition(fetchedPlacementValue);
        
        setConfig({
          ...fetchedConfig,
          position: {
            ...fetchedConfig.position,
            placement: validatedPlacement
          }
        });
        setError(null);
      } catch (err) {
        const errorInstance = err instanceof Error ? err : new Error('Failed to fetch config');
        logger.error('Failed to fetch widget config', 'useWidgetConfig', errorInstance);
        
        // Get the default placement value for error fallback
        const defaultPlacementValue = defaultConfig.position?.placement || 'bottom-right';
        const validatedPlacement: ChatPositionString = ensureValidPosition(defaultPlacementValue);
        
        setConfig({
          ...defaultConfig,
          workspaceId,
          position: {
            ...defaultConfig.position,
            placement: validatedPlacement
          },
          ...getDefaultConfig(workspaceId)
        });
        setError(errorInstance);
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, [workspaceId]);

  return { config, loading, error };
}

export default useWidgetConfig;
