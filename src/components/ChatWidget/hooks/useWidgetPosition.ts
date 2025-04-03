
import { useMemo } from 'react';
import { ChatWidgetConfig } from '../config';
import { ChatPositionString } from '../types';
import { isValidChatPosition } from '../embed/core/optionsValidator';

/**
 * Helper function to ensure the position is valid
 * This provides a type guard and ensures we always have a valid position
 */
function ensureValidPosition(position: unknown): ChatPositionString {
  if (typeof position === 'string' && isValidChatPosition(position)) {
    return position;
  }
  return 'bottom-right';
}

/**
 * Hook to handle widget positioning based on configuration
 */
export function useWidgetPosition(
  config: ChatWidgetConfig,
  isMobile: boolean
) {
  // Get the position styles for the launcher button
  const getLauncherPositionStyles = useMemo(() => {
    // Extract position string from config with fallback
    const positionFromConfig = config.position?.placement || 'bottom-right';
    
    // Ensure we have a valid position string
    const positionString = ensureValidPosition(positionFromConfig);
      
    // Get offset values with fallbacks for mobile/desktop
    const offsetX = typeof config.position === 'object' && config.position.offsetX !== undefined
      ? config.position.offsetX 
      : (isMobile ? 0.5 : 1);
      
    const offsetY = typeof config.position === 'object' && config.position.offsetY !== undefined
      ? config.position.offsetY
      : (isMobile ? 0.5 : 1);
    
    // Create position styles based on the validated position
    let positionStyle: React.CSSProperties = {};
    
    switch(positionString) {
      case 'bottom-left':
        positionStyle = { 
          bottom: `${offsetY}rem`, 
          left: `${offsetX}rem`, 
          right: 'auto',
          top: 'auto'
        };
        break;
      case 'top-right':
        positionStyle = { 
          top: `${offsetY}rem`, 
          right: `${offsetX}rem`,
          bottom: 'auto',
          left: 'auto'
        };
        break;
      case 'top-left':
        positionStyle = { 
          top: `${offsetY}rem`, 
          left: `${offsetX}rem`,
          bottom: 'auto',
          right: 'auto'
        };
        break;
      case 'bottom-right':
      default:
        positionStyle = { 
          bottom: `${offsetY}rem`, 
          right: `${offsetX}rem`,
          top: 'auto',
          left: 'auto'
        };
    }
    
    return positionStyle;
  }, [config.position, isMobile]);

  // Get the position styles for the widget container
  const getWidgetContainerPositionStyles = useMemo(() => {
    // Extract position string from config with fallback
    const positionFromConfig = config.position?.placement || 'bottom-right';
    
    // Ensure we have a valid position string
    const positionString = ensureValidPosition(positionFromConfig);
      
    // Get offset values with fallbacks for mobile/desktop
    const offsetX = typeof config.position === 'object' && config.position.offsetX !== undefined
      ? config.position.offsetX 
      : (isMobile ? 0.5 : 1);
      
    const offsetY = typeof config.position === 'object' && config.position.offsetY !== undefined
      ? config.position.offsetY
      : (isMobile ? 0.5 : 1);
    
    // Calculate additional offset for container based on launcher height
    const launcherHeight = isMobile ? 3.5 : 4;
    const containerMargin = 0.25;
    const totalOffset = offsetY + launcherHeight + containerMargin;
    
    // Create position styles based on the validated position
    let positionStyle: React.CSSProperties = {};
    
    switch(positionString) {
      case 'bottom-left':
        positionStyle = { 
          bottom: `${totalOffset}rem`, 
          left: `${offsetX}rem`, 
          right: 'auto',
          top: 'auto'
        };
        break;
      case 'top-right':
        positionStyle = { 
          top: `${offsetY}rem`, 
          right: `${offsetX}rem`,
          bottom: 'auto',
          left: 'auto'
        };
        break;
      case 'top-left':
        positionStyle = { 
          top: `${offsetY}rem`, 
          left: `${offsetX}rem`,
          bottom: 'auto',
          right: 'auto'
        };
        break;
      case 'bottom-right':
      default:
        positionStyle = { 
          bottom: `${totalOffset}rem`, 
          right: `${offsetX}rem`,
          top: 'auto',
          left: 'auto'
        };
    }
    
    return positionStyle;
  }, [config.position, isMobile]);

  return {
    getLauncherPositionStyles,
    getWidgetContainerPositionStyles
  };
}
