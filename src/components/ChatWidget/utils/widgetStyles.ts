
import { ChatWidgetConfig } from '../config';

/**
 * Gets the position class based on the config
 */
export function getPositionClass(position?: string): string {
  switch (position) {
    case 'bottom-left': return 'bottom-4 left-4';
    case 'top-right': return 'top-4 right-4';
    case 'top-left': return 'top-4 left-4';
    default: return 'bottom-4 right-4';
  }
}

/**
 * Gets the message style class based on the config
 */
export function getMessageStyleClass(messageStyle?: string): string {
  switch (messageStyle) {
    case 'square': return 'chat-widget-squared';
    case 'bubble': return 'chat-widget-bubbles';
    default: return ''; // Default rounded style
  }
}

/**
 * Gets the button style class based on the config
 */
export function getButtonStyleClass(buttonStyle?: string): string {
  switch (buttonStyle) {
    case 'outline': return 'chat-widget-button-outline';
    case 'ghost': return 'chat-widget-button-ghost';
    case 'soft': return 'chat-widget-button-soft';
    default: return 'chat-widget-button'; // Default solid style
  }
}

/**
 * Gets the widget styling based on the branding config
 */
export function getWidgetStyles(config: ChatWidgetConfig): React.CSSProperties {
  return {
    // Base styles
    ...(config.branding?.primaryColor && {
      '--vivid-purple': config.branding.primaryColor,
    }),
    // Enhanced styling
    ...(config.branding?.borderRadius && {
      '--radius': config.branding.borderRadius,
    }),
    ...(config.branding?.fontFamily && {
      'fontFamily': config.branding.fontFamily,
    }),
    // Theme colors for bubbles and headers
    ...(config.branding?.widgetHeader?.backgroundColor && {
      '--chat-header-bg': config.branding.widgetHeader.backgroundColor,
    }),
    ...(config.branding?.widgetHeader?.textColor && {
      '--chat-header-text': config.branding.widgetHeader.textColor,
    }),
    ...(config.branding?.userBubble?.backgroundColor && {
      '--user-bubble-bg': config.branding.userBubble.backgroundColor,
    }),
    ...(config.branding?.userBubble?.textColor && {
      '--user-bubble-text': config.branding.userBubble.textColor,
    }),
    ...(config.branding?.systemBubble?.backgroundColor && {
      '--system-bubble-bg': config.branding.systemBubble.backgroundColor,
    }),
    ...(config.branding?.systemBubble?.textColor && {
      '--system-bubble-text': config.branding.systemBubble.textColor,
    }),
    // Any custom CSS properties
    ...(config.branding?.customCSS && config.branding.customCSS),
  } as React.CSSProperties;
}

/**
 * Gets button style based on the config
 */
export function getButtonStyle(primaryColor?: string): React.CSSProperties {
  return primaryColor 
    ? { backgroundColor: primaryColor, borderColor: primaryColor }
    : {};
}
