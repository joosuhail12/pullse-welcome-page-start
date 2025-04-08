
import { useMemo } from 'react';
import { ChatWidgetConfig, ChatLayout } from '../config';

export function useWidgetPosition(
  config: ChatWidgetConfig,
  isMobile: boolean
) {
  const getLauncherPositionStyles = useMemo(() => {
    // Convert string position to object if needed
    const position = typeof config.layout.placement === 'string'
      ? config.layout.placement
      : (config.layout?.placement || 'bottom-right');

    // Handle offset values correctly
    const offsetX = typeof config.layout.placement === 'object' && config.layout.offsetX !== undefined
      ? config.layout.offsetX
      : (isMobile ? 0.5 : 1);

    const offsetY = typeof config.layout.placement === 'object' && config.layout.offsetY !== undefined
      ? config.layout.offsetY
      : (isMobile ? 0.5 : 1);

    let positionStyle: React.CSSProperties = {};

    switch (position) {
      case 'left':
        positionStyle = {
          bottom: `${offsetY}rem`,
          left: `${offsetX}rem`,
          right: 'auto',
          top: 'auto'
        };
        break;
      case 'right':
      default:
        positionStyle = {
          bottom: `${offsetY}rem`,
          right: `${offsetX}rem`,
          top: 'auto',
          left: 'auto'
        };
    }

    return positionStyle;
  }, [config.layout.placement, isMobile]);

  const getWidgetContainerPositionStyles = useMemo(() => {
    // Convert string position to object if needed
    const position = typeof config.layout.placement === 'string'
      ? config.layout.placement
      : (config.layout?.placement || 'bottom-right');

    // Handle offset values correctly
    const offsetX = typeof config.layout.placement === 'object' && config.layout.offsetX !== undefined
      ? config.layout.offsetX
      : (isMobile ? 0.5 : 1);

    const offsetY = typeof config.layout.placement === 'object' && config.layout.offsetY !== undefined
      ? config.layout.offsetY
      : (isMobile ? 0.5 : 1);

    const launcherHeight = isMobile ? 3.5 : 4;
    const containerMargin = 0.25;
    const totalOffset = offsetY + launcherHeight + containerMargin;

    let positionStyle: React.CSSProperties = {};

    switch (position) {
      case 'left':
        positionStyle = {
          bottom: `${totalOffset}rem`,
          left: `${offsetX}rem`,
          right: 'auto',
          top: 'auto'
        };
        break;
      case 'right':
      default:
        positionStyle = {
          bottom: `${totalOffset}rem`,
          right: `${offsetX}rem`,
          top: 'auto',
          left: 'auto'
        };
    }

    return positionStyle;
  }, [config.layout.placement, isMobile]);

  return {
    getLauncherPositionStyles,
    getWidgetContainerPositionStyles
  };
}
