
import React, { useState, useEffect, useMemo } from 'react';
import { defaultConfig, ChatWidgetConfig } from '../config';
import BrandLogo from '../components/BrandLogo';
import WelcomeHeader from '../components/WelcomeHeader';
import WelcomeImage from '../components/WelcomeImage';
import QuickPrompts from '../components/QuickPrompts';
import ActionButton from '../components/ActionButton';

interface HomeViewProps {
  onStartChat: (formData?: Record<string, string>) => void;
  config?: ChatWidgetConfig;
}

const HomeView = ({ 
  onStartChat, 
  config = defaultConfig 
}: HomeViewProps) => {
  const [mounted, setMounted] = useState(false);
  const [typingComplete, setTypingComplete] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  
  // Apply custom branding if available
  const buttonStyle = useMemo(() => {
    return config.branding?.primaryColor 
      ? { backgroundColor: config.branding.primaryColor, borderColor: config.branding.primaryColor }
      : {};
  }, [config.branding?.primaryColor]);

  // Custom styles from theme if available
  const themeStyles = useMemo(() => {
    return {
      fontFamily: config.branding?.fontFamily || 'inherit',
      backgroundGradient: config.branding?.backgroundGradient || 'from-white via-gray-50 to-white',
      headerGradient: config.branding?.headerGradient || 'from-vivid-purple-600 to-vivid-purple-400',
    };
  }, [config.branding]);
  
  // Handle direct chat start (no form)
  const handleStartChat = () => {
    // Start chat with selected prompt if available
    onStartChat(selectedPrompt ? { initialPrompt: selectedPrompt } : undefined);
  };

  // Handle quick prompt selection
  const handlePromptSelect = (prompt: string) => {
    setSelectedPrompt(prompt);
    // Start chat with the selected prompt
    onStartChat({ initialPrompt: prompt });
  };

  // Component mount effect
  useEffect(() => {
    setMounted(true);
    
    if (config.welcomeMessage) {
      // Immediately set typing as complete
      setTypingComplete(true);
    }
  }, [config.welcomeMessage]);

  return (
    <div 
      className={`flex flex-col p-6 h-full bg-gradient-to-br ${themeStyles.backgroundGradient} rounded-lg backdrop-blur-sm bg-opacity-95 transition-all duration-700 ease-in-out ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      style={{ fontFamily: themeStyles.fontFamily }}
      role="dialog"
      aria-labelledby="welcome-heading"
    >
      <BrandLogo logoUrl={config.branding?.logoUrl} />
      
      <WelcomeHeader 
        config={config}
        typingComplete={typingComplete}
        themeStyles={themeStyles}
      />
      
      <WelcomeImage
        imageUrl={config.welcomeImageUrl}
        typingComplete={typingComplete}
        onImageLoad={() => setImageLoaded(true)}
      />

      {config.features?.quickPrompts && config.quickPrompts && config.quickPrompts.length > 0 && (
        <QuickPrompts
          prompts={config.quickPrompts}
          typingComplete={typingComplete}
          onPromptSelect={handlePromptSelect}
          config={config}
        />
      )}
      
      <ActionButton
        typingComplete={typingComplete}
        buttonStyle={buttonStyle}
        onStartChat={handleStartChat}
        config={config}
      />
    </div>
  );
};

export default HomeView;
