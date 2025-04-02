
// TypeScript types for the embed script

// Widget configuration interface
export interface WidgetConfig {
  workspaceId: string | undefined;
  branding: {
    primaryColor: string | undefined;
    showBrandingBar: boolean;
    
    // Enhanced styling options
    borderRadius: string | undefined;
    buttonStyle: string | undefined;
    messageStyle: string | undefined;
    theme: string | undefined;
    fontFamily: string | undefined;
    
    // Advanced color customization
    widgetHeader: {
      backgroundColor: string | undefined;
      textColor: string | undefined;
    };
    userBubble: {
      backgroundColor: string | undefined;
      textColor: string | undefined;
    };
    systemBubble: {
      backgroundColor: string | undefined;
      textColor: string | undefined;
    };
    inputBox: {
      backgroundColor: string | undefined;
      textColor: string | undefined;
      borderColor: string | undefined;
    };
  };
  
  // Position configuration
  position: string;
  
  // Feature flags
  features: {
    fileUpload: boolean;
    messageRating: boolean;
    readReceipts: boolean;
    typingIndicators: boolean;
  };
}

// ChatWidget interface
export interface ChatWidgetInterface {
  init: (config?: any) => any;
  open: () => void;
  close: () => void;
  toggle: () => void;
  on?: (eventName: string, callback: (detail: any) => void) => () => void;
  off?: (eventName: string, handler: any) => void;
}

// Extend the window interface
declare global {
  interface Window {
    ChatWidget?: ChatWidgetInterface;
  }
}
