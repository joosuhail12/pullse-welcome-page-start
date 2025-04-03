
import { useMemo } from 'react';
import { ChatWidgetConfig } from '../config';

export function useWidgetPosition(
  config: ChatWidgetConfig,
  isMobile: boolean
) {
  const getLauncherPositionStyles = useMemo(() => {
    const position = config.position?.placement || 'bottom-right';
    // Adjust offsets for mobile - smaller offsets on mobile for better edge positioning
    const offsetX = config.position?.offsetX !== undefined ? config.position.offsetX : (isMobile ? 0.5 : 1);
    const offsetY = config.position?.offsetY !== undefined ? config.position.offsetY : (isMobile ? 0.5 : 1);
    
    let positionStyle: React.CSSProperties = {};
    
    switch(position) {
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
    const position = config.position?.placement || 'bottom-right';
    // Adjust offsets for mobile - smaller offsets on mobile for better edge positioning
    const offsetX = config.position?.offsetX !== undefined ? config.position.offsetX : (isMobile ? 0.5 : 1);
    const offsetY = config.position?.offsetY !== undefined ? config.position.offsetY : (isMobile ? 0.5 : 1);
    const launcherHeight = isMobile ? 3.5 : 4;
    const containerMargin = 0.25;
    const totalOffset = offsetY + launcherHeight + containerMargin;
    
    let positionStyle: React.CSSProperties = {};
    
    switch(position) {
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
