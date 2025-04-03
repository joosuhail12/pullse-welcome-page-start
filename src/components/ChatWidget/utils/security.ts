
/**
 * Security utilities for chat widget
 * 
 * NOTICE: This file has been refactored for better maintainability.
 * Please import from the new modular structure at:
 * `src/components/ChatWidget/utils/security/index.ts`
 * 
 * This file is kept for backward compatibility only and will be removed in a future version.
 */

// Re-export everything from the new modular structure
export * from './security/index';

// Log deprecation warning
import { logger } from '@/lib/logger';

if (import.meta.env.DEV) {
  logger.warn(
    'Using deprecated security.ts file directly. Please update imports to use the new modular structure.',
    'security.ts'
  );
}
