
export interface PreChatFormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel';
  required: boolean;
  placeholder?: string;
}

export interface BrandingConfig {
  primaryColor: string;
  fontFamily?: string;
  avatarIcon?: string;
  showBrandingBar: boolean;
}

export interface FeatureToggles {
  inlineRatings: boolean;
  feedback: boolean;
}

export interface ChatWidgetConfig {
  welcomeMessage: string;
  preChatForm: {
    enabled: boolean;
    fields: PreChatFormField[];
  };
  branding?: BrandingConfig;
  features?: FeatureToggles;
  workspaceId?: string;
}

// Default configuration
export const defaultConfig: ChatWidgetConfig = {
  welcomeMessage: "Welcome to Pullse Chat",
  preChatForm: {
    enabled: true,
    fields: [
      {
        id: 'name',
        name: 'name',
        label: 'Name',
        type: 'text',
        required: true,
        placeholder: 'Enter your name'
      },
      {
        id: 'email',
        name: 'email',
        label: 'Email',
        type: 'email',
        required: true,
        placeholder: 'Enter your email'
      },
      {
        id: 'company',
        name: 'company',
        label: 'Company',
        type: 'text',
        required: false,
        placeholder: 'Enter your company name'
      },
      {
        id: 'phone',
        name: 'phone',
        label: 'Phone',
        type: 'tel',
        required: false,
        placeholder: 'Enter your phone number'
      }
    ]
  },
  branding: {
    primaryColor: '#8B5CF6', // Default vivid-purple
    showBrandingBar: true,
  },
  features: {
    inlineRatings: false,
    feedback: false
  }
};
