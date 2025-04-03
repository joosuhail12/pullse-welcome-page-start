
import { useState, useEffect } from 'react';
import { fetchChatWidgetConfig } from '../services/api';
import { ChatWidgetConfig, defaultConfig, ChatPosition } from '../config';
import { getDefaultConfig } from '../embed/api';
import { logger } from '@/lib/logger';
import { isValidChatPosition } from '../embed/core/optionsValidator';

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
          
          // Get the default placement value
          const defaultPlacementValue = defaultConfig.position?.placement || 'bottom-right';
          
          // We need to verify and ensure type safety for ChatPosition
          let validatedPlacement: ChatPosition;
          
          // Use our type guard to verify the position is valid
          if (isValidChatPosition(defaultPlacementValue)) {
            // TypeScript now knows this is a valid ChatPosition
            validatedPlacement = defaultPlacementValue;
          } else {
            // Default to a known valid position
            validatedPlacement = 'bottom-right';
          }
          
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
        
        // Get the fetched placement value
        const fetchedPlacementValue = fetchedConfig.position?.placement || 'bottom-right';
        
        // We need to verify and ensure type safety for ChatPosition
        let validatedPlacement: ChatPosition;
        
        // Use our type guard to verify the position is valid
        if (isValidChatPosition(fetchedPlacementValue)) {
          // TypeScript now knows this is a valid ChatPosition
          validatedPlacement = fetchedPlacementValue;
        } else {
          // Default to a known valid position
          validatedPlacement = 'bottom-right';
        }
        
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
        
        // We need to verify and ensure type safety for ChatPosition
        let validatedPlacement: ChatPosition;
        
        // Use our type guard to verify the position is valid
        if (isValidChatPosition(defaultPlacementValue)) {
          // TypeScript now knows this is a valid ChatPosition
          validatedPlacement = defaultPlacementValue;
        } else {
          // Default to a known valid position
          validatedPlacement = 'bottom-right';
        }
        
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
