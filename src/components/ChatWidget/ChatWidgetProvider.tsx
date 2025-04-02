
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ChatWidgetConfig, defaultConfig } from './config';

interface ChatWidgetContextProps {
  config: ChatWidgetConfig;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const ChatWidgetContext = createContext<ChatWidgetContextProps>({
  config: defaultConfig,
  isOpen: false,
  setIsOpen: () => {}
});

export const useChatWidgetContext = () => useContext(ChatWidgetContext);

interface ChatWidgetProviderProps {
  config?: Partial<ChatWidgetConfig>;
  children: React.ReactNode;
}

export const ChatWidgetProvider: React.FC<ChatWidgetProviderProps> = ({ 
  config = {}, 
  children 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mergedConfig, setMergedConfig] = useState<ChatWidgetConfig>({
    ...defaultConfig,
    ...config
  });
  
  useEffect(() => {
    // Merge the provided config with the default config
    setMergedConfig({
      ...defaultConfig,
      ...config,
      // Deep merge for nested objects
      branding: {
        ...defaultConfig.branding,
        ...config.branding
      },
      features: {
        ...defaultConfig.features,
        ...config.features
      },
      preChatForm: {
        ...defaultConfig.preChatForm,
        ...config.preChatForm,
        fields: config.preChatForm?.fields || defaultConfig.preChatForm.fields
      },
      realtime: {
        ...defaultConfig.realtime,
        ...config.realtime
      }
    });
  }, [config]);
  
  // Listen for external control events
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);
    const handleToggle = () => setIsOpen(prev => !prev);
    
    window.addEventListener('pullse:widget:open', handleOpen);
    window.addEventListener('pullse:widget:close', handleClose);
    window.addEventListener('pullse:widget:toggle', handleToggle);
    
    return () => {
      window.removeEventListener('pullse:widget:open', handleOpen);
      window.removeEventListener('pullse:widget:close', handleClose);
      window.removeEventListener('pullse:widget:toggle', handleToggle);
    };
  }, []);
  
  return (
    <ChatWidgetContext.Provider value={{ 
      config: mergedConfig, 
      isOpen, 
      setIsOpen 
    }}>
      {children}
    </ChatWidgetContext.Provider>
  );
};

export default ChatWidgetProvider;
