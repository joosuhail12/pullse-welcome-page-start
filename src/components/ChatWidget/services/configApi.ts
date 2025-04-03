
/**
 * Chat Widget Configuration API Service
 * 
 * Provides methods to fetch chat widget configuration with
 * resilience patterns and fallback mechanisms.
 * 
 * SECURITY NOTICE: Configuration requests implement integrity validation.
 */

import { ChatWidgetConfig, defaultConfig } from '../config';
import { getChatSessionId, setChatSessionId } from '../utils/cookies';
import { CONFIG_CIRCUIT, createSecureHeaders, enforceSecureConnection, checkCircuitStatus, sanitizeApiInputs, verifyResponseIntegrity, validateJsonResponse } from './apiCore';
import { withResilience } from '../utils/resilience';
import { getDefaultConfig } from '../embed/api';
import { logger } from '@/lib/logger';
import { sanitizeErrorMessage } from '@/lib/error-sanitizer';
import { errorHandler } from '@/lib/error-handler';

/**
 * Fetch chat widget configuration from the API
 * @param workspaceId The workspace ID to fetch configuration for
 * @returns Promise resolving to the chat widget configuration
 * 
 * TODO: Implement full signature verification for all responses
 * TODO: Add caching with security headers for performance
 * TODO: Implement tiered fallbacks for critical configuration
 */
export const fetchChatWidgetConfig = async (workspaceId: string): Promise<ChatWidgetConfig> => {
  try {
    // Enforce HTTPS for security
    if (!enforceSecureConnection()) {
      // If redirecting to HTTPS, return default config temporarily
      return { ...defaultConfig, workspaceId: sanitizeApiInputs({ workspaceId }).workspaceId };
    }
    
    // Validate and sanitize workspaceId
    const sanitizedWorkspaceId = sanitizeApiInputs({ workspaceId }).workspaceId;
    
    // In development/demo mode, we'll just use default config
    // since the API may not be available or may return HTML instead of JSON
    if (import.meta.env.DEV || window.location.hostname.includes('lovableproject.com')) {
      logger.debug(`Using default config for workspace ${sanitizedWorkspaceId} in development mode`, 'configApi');
      return {
        ...defaultConfig,
        workspaceId: sanitizedWorkspaceId,
        ...getDefaultConfig(sanitizedWorkspaceId)
      };
    }
    
    // Check if circuit is already open (too many failures)
    if (checkCircuitStatus(CONFIG_CIRCUIT, 'Config')) {
      logger.warn('Config API circuit is open, using default config', 'configApi');
      return { 
        ...defaultConfig, 
        workspaceId: sanitizedWorkspaceId,
        ...getDefaultConfig(sanitizedWorkspaceId)
      };
    }
    
    return await withResilience(
      async () => {
        // Check if we have a session ID
        const sessionId = getChatSessionId();
        let url = `/api/chat-widget/config?workspaceId=${encodeURIComponent(sanitizedWorkspaceId)}`;
        
        // Append session ID if available
        if (sessionId) {
          url += `&sessionId=${encodeURIComponent(sessionId)}`;
        }
        
        // Create secure headers
        const headers = createSecureHeaders(sanitizedWorkspaceId);
        
        const response = await fetch(url, {
          headers,
          credentials: 'include' // Include cookies in request
        });
        
        if (!response.ok) {
          // If we get an error response, throw an error to trigger retry
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        // Validate JSON response
        validateJsonResponse(response);
        
        const config = await response.json();
        
        // Verify response integrity
        if (!verifyResponseIntegrity(response, config)) {
          logger.error('Response signature verification failed', 'configApi');
          throw new Error('Response integrity check failed');
        }
        
        // Check if response contains a sessionId and store it
        if (config.sessionId && !sessionId) {
          setChatSessionId(config.sessionId);
        }
        
        return config;
      },
      CONFIG_CIRCUIT,
      // Custom retry options for config API
      {
        maxRetries: 2,
        initialDelayMs: 200,
        maxDelayMs: 1000
      },
      // Custom circuit breaker options for config API
      {
        failureThreshold: 3,
        resetTimeoutMs: 60000 // 1 minute
      }
    );
  } catch (error) {
    // Log the error with sanitized details
    errorHandler.handleStandardError(error instanceof Error 
      ? new Error(sanitizeErrorMessage(error.message))
      : new Error('Failed to fetch config')
    );
    
    // Always fall back to default config for reliability
    return { 
      ...defaultConfig, 
      workspaceId: sanitizeApiInputs({ workspaceId }).workspaceId,
      ...getDefaultConfig(sanitizeApiInputs({ workspaceId }).workspaceId)
    };
  }
};
