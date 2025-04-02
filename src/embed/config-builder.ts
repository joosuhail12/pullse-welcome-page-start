
import { WidgetConfig } from './types';
import { getDataAttribute } from './constants';

export function buildConfigFromScript(script: HTMLScriptElement): WidgetConfig {
  return {
    workspaceId: getDataAttribute(script, 'workspace-id', undefined),
    branding: {
      primaryColor: getDataAttribute(script, 'primary-color', undefined),
      showBrandingBar: getDataAttribute(script, 'show-branding', 'true') !== 'false',
      
      // Enhanced styling options
      borderRadius: getDataAttribute(script, 'border-radius', undefined),
      buttonStyle: getDataAttribute(script, 'button-style', undefined),
      messageStyle: getDataAttribute(script, 'message-style', undefined),
      theme: getDataAttribute(script, 'theme', undefined),
      fontFamily: getDataAttribute(script, 'font-family', undefined),
      
      // Advanced color customization
      widgetHeader: {
        backgroundColor: getDataAttribute(script, 'header-bg-color', undefined),
        textColor: getDataAttribute(script, 'header-text-color', undefined),
      },
      userBubble: {
        backgroundColor: getDataAttribute(script, 'user-bubble-color', undefined),
        textColor: getDataAttribute(script, 'user-text-color', undefined),
      },
      systemBubble: {
        backgroundColor: getDataAttribute(script, 'system-bubble-color', undefined),
        textColor: getDataAttribute(script, 'system-text-color', undefined),
      },
      inputBox: {
        backgroundColor: getDataAttribute(script, 'input-bg-color', undefined),
        textColor: getDataAttribute(script, 'input-text-color', undefined),
        borderColor: getDataAttribute(script, 'input-border-color', undefined),
      }
    },
    position: getDataAttribute(script, 'position', 'bottom-right'),
    features: {
      fileUpload: getDataAttribute(script, 'file-upload', 'true') !== 'false',
      messageRating: getDataAttribute(script, 'message-rating', 'false') === 'true',
      readReceipts: getDataAttribute(script, 'read-receipts', 'true') !== 'false',
      typingIndicators: getDataAttribute(script, 'typing-indicators', 'true') !== 'false'
    }
  };
}

export function mergeConfigs(baseConfig: WidgetConfig, customConfig: any = {}): WidgetConfig {
  return {
    ...baseConfig,
    ...customConfig,
    branding: {
      ...baseConfig.branding,
      ...(customConfig.branding || {}),
      widgetHeader: {
        ...baseConfig.branding.widgetHeader,
        ...(customConfig.branding?.widgetHeader || {})
      },
      userBubble: {
        ...baseConfig.branding.userBubble,
        ...(customConfig.branding?.userBubble || {})
      },
      systemBubble: {
        ...baseConfig.branding.systemBubble,
        ...(customConfig.branding?.systemBubble || {})
      },
      inputBox: {
        ...baseConfig.branding.inputBox,
        ...(customConfig.branding?.inputBox || {})
      }
    },
    features: {
      ...baseConfig.features,
      ...(customConfig.features || {})
    }
  };
}
