
/**
 * Chat Widget Messaging API Service
 * 
 * Provides methods to send chat messages with resilience patterns,
 * rate limiting, and security features.
 * 
 * SECURITY NOTICE: Message sending implements CSRF protection,
 * input validation, and response verification.
 */

import { getMessage } from '../utils/messageHandlers';
import { MESSAGE_CIRCUIT, createSecureHeaders, enforceSecureConnection, checkCircuitStatus, sanitizeApiInputs, verifyResponseIntegrity, validateJsonResponse } from './apiCore';
import { getChatSessionId, setChatSessionId } from '../utils/cookies';
import { isRateLimited } from '../utils/security';
import { validateMessage } from '../utils/validation';
import { withResilience } from '../utils/resilience';
import { toast } from '@/components/ui/use-toast';
import { sanitizeErrorMessage } from '@/lib/error-sanitizer';
import { logger } from '@/lib/logger';

/**
 * Send a message to the chat API
 * @param message The message to send
 * @param workspaceId The workspace ID
 * @returns Promise resolving to the API response
 * 
 * TODO: Add message content filtering for security
 * TODO: Implement secure file uploads with content scanning
 * TODO: Add end-to-end encryption options for sensitive communications
 */
export const sendChatMessage = async (message: string, workspaceId: string): Promise<any> => {
  try {
    // Enforce HTTPS for security
    if (!enforceSecureConnection()) {
      toast({
        title: "Security Error",
        description: "Redirecting to secure connection",
        variant: "destructive"
      });
      throw new Error('Redirecting to HTTPS');
    }
    
    // Check rate limiting first
    if (isRateLimited()) {
      toast({
        title: "Rate limit exceeded",
        description: "Please wait before sending more messages",
        variant: "destructive"
      });
      throw new Error('Rate limit exceeded');
    }
    
    // Check if circuit is already open (too many failures)
    if (checkCircuitStatus(MESSAGE_CIRCUIT, 'Message')) {
      toast({
        title: "Service Unavailable",
        description: "The chat service is currently unavailable. Please try again later.",
        variant: "destructive"
      });
      throw new Error('Message API circuit is open');
    }
    
    // Use resilience pattern for sending messages
    return await withResilience(
      async () => {
        // Validate and sanitize inputs
        const sanitizedMessage = validateMessage(message);
        const sanitizedWorkspaceId = sanitizeApiInputs({ workspaceId }).workspaceId;
        const sessionId = getChatSessionId();
        
        // Generate timestamp for request signing
        const timestamp = Date.now();
        
        const payload = {
          message: sanitizedMessage,
          workspaceId: sanitizedWorkspaceId,
          sessionId,
          timestamp
        };
        
        // Create secure headers with tokens
        const headers = createSecureHeaders(sanitizedMessage + sanitizedWorkspaceId);
        
        const response = await fetch('/api/chat-widget/message', {
          method: 'POST',
          headers,
          credentials: 'include', // Include cookies in request
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        // Validate JSON response
        validateJsonResponse(response);
        
        const data = await response.json();
        
        // Verify response integrity
        if (!verifyResponseIntegrity(response, data)) {
          logger.error('Response signature verification failed', 'messageApi');
          throw new Error('Response integrity check failed');
        }
        
        // Store session ID from response if available
        if (data.sessionId && !sessionId) {
          setChatSessionId(data.sessionId);
        }
        
        return data;
      },
      MESSAGE_CIRCUIT,
      // Custom retry options for message API
      {
        maxRetries: 2,
        initialDelayMs: 500,
        maxDelayMs: 2000
      },
      // Custom circuit breaker options for message API
      {
        failureThreshold: 4,
        resetTimeoutMs: 45000 // 45 seconds
      }
    );
  } catch (error) {
    // Get sanitized error message for logging and display
    const safeErrorMessage = sanitizeErrorMessage(error);
    
    // Show appropriate error message based on error type
    if (error instanceof Error) {
      if (error.message.includes('circuit is open')) {
        // Circuit is open error (already handled above)
        // Just rethrow
      } else if (error.message.includes('Rate limit')) {
        // Rate limit error (already handled above)
        // Just rethrow
      } else {
        // Generic error with sanitized message
        toast({
          title: "Failed to send message",
          description: "Please check your connection and try again",
          variant: "destructive"
        });
      }
    }
    
    throw error;
  }
};
