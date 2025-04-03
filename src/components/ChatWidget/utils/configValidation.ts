
import { ChatWidgetConfig, ChatPosition } from '../config';

// Valid placement values
const VALID_PLACEMENTS = ['bottom-right', 'bottom-left', 'top-right', 'top-left'] as const;
export type ValidPlacement = typeof VALID_PLACEMENTS[number];

/**
 * Validate and normalize the position placement value
 * @param placement The placement value to validate
 * @returns A valid placement value
 */
export function validatePlacement(placement: string): ValidPlacement {
  if (VALID_PLACEMENTS.includes(placement as ValidPlacement)) {
    return placement as ValidPlacement;
  }
  // Default to bottom-right if invalid
  console.warn(`Invalid placement value: "${placement}". Using default "bottom-right" instead.`);
  return 'bottom-right';
}

/**
 * Validate and normalize position config
 * @param position The position configuration to validate
 * @returns A valid position configuration
 */
export function validatePositionConfig(position: any): ChatPosition {
  if (!position) return { placement: 'bottom-right', offsetX: 4, offsetY: 4 };
  
  return {
    placement: position.placement ? validatePlacement(position.placement) : 'bottom-right',
    offsetX: typeof position.offsetX === 'number' ? position.offsetX : 4,
    offsetY: typeof position.offsetY === 'number' ? position.offsetY : 4
  };
}

/**
 * Safely cast a config object to ChatWidgetConfig with validation
 * @param config Input configuration object
 * @returns Validated ChatWidgetConfig
 */
export function validateConfig(config: any): ChatWidgetConfig {
  if (!config) return { ...config };
  
  // Create a new config object with validated properties
  const validatedConfig: ChatWidgetConfig = {
    ...config,
    position: validatePositionConfig(config.position),
  };
  
  return validatedConfig;
}
