
import { useMemo } from 'react';
import { ChatWidgetConfig } from '../config';
import { ChatPositionString } from '../types';

export function useWidgetPosition(
  config: ChatWidgetConfig,
  isMobile: boolean
) {
  const getLauncherPositionStyles = useMemo(() => {
    // Convert position to a valid ChatPositionString
    let positionString: ChatPositionString = 'bottom-right';
    
    // Extract position string from config
    if (typeof config.position?.placement === 'string') {
      // Check if the position is valid
      if (['bottom-right', 'bottom-left', 'top-right', 'top-left'].includes(config.position.placement)) {
        positionString = config.position.placement as ChatPositionString;
      }
    }
      
    // Handle offset values correctly
    const offsetX = typeof config.position === 'object' && config.position.offsetX !== undefined
      ? config.position.offsetX 
      : (isMobile ? 0.5 : 1);
      
    const offsetY = typeof config.position === 'object' && config.position.offsetY !== undefined
      ? config.position.offsetY
      : (isMobile ? 0.5 : 1);
    
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

  const getWidgetContainerPositionStyles = useMemo(() => {
    // Convert position to a valid ChatPositionString
    let positionString: ChatPositionString = 'bottom-right';
    
    // Extract position string from config
    if (typeof config.position?.placement === 'string') {
      // Check if the position is valid
      if (['bottom-right', 'bottom-left', 'top-right', 'top-left'].includes(config.position.placement)) {
        positionString = config.position.placement as ChatPositionString;
      }
    }
      
    // Handle offset values correctly
    const offsetX = typeof config.position === 'object' && config.position.offsetX !== undefined
      ? config.position.offsetX 
      : (isMobile ? 0.5 : 1);
      
    const offsetY = typeof config.position === 'object' && config.position.offsetY !== undefined
      ? config.position.offsetY
      : (isMobile ? 0.5 : 1);
    
    const launcherHeight = isMobile ? 3.5 : 4;
    const containerMargin = 0.25;
    const totalOffset = offsetY + launcherHeight + containerMargin;
    
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
