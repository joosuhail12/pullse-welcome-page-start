import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import ChatWidget from '../ChatWidget';
import { ChatWidgetConfig, defaultConfig } from '../config';
import { createValidatedEvent, EventManager } from '../events';
import { useIsMobile } from '@/hooks/use-mobile';

interface PreviewWidgetProps {
  onSave?: (config: ChatWidgetConfig) => void;
  initialConfig?: Partial<ChatWidgetConfig>;
}

const PreviewWidget: React.FC<PreviewWidgetProps> = ({ 
  onSave, 
  initialConfig = {}
}) => {
  const [config, setConfig] = useState<ChatWidgetConfig>({
    ...defaultConfig,
    ...initialConfig,
    workspaceId: initialConfig.workspaceId || 'preview-mode'
  });
  
  const [activeTab, setActiveTab] = useState('appearance');
  const [previewVisible, setPreviewVisible] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Effect to handle configuration changes
  useEffect(() => {
    // Create an event to notify that configuration has changed
    const event = createValidatedEvent('chat:configUpdated', { config });
    
    // If event was created successfully, dispatch it
    if (event) {
      const eventManager = new EventManager();
      eventManager.handleEvent(event);
    }
  }, [config]);

  const handleColorChange = (color: string) => {
    setConfig({
      ...config,
      branding: {
        ...config.branding,
        primaryColor: color
      }
    });
  };

  const handleWelcomeMessageChange = (message: string) => {
    setConfig({
      ...config,
      welcomeMessage: message
    });
  };

  const handlePositionChange = (position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left') => {
    setConfig({
      ...config,
      position: {
        ...config.position,
        placement: position
      }
    });
  };

  const handleBrandingToggle = (showBranding: boolean) => {
    setConfig({
      ...config,
      branding: {
        ...config.branding,
        showBrandingBar: showBranding
      }
    });
  };

  const handlePreChatFormToggle = (enabled: boolean) => {
    setConfig({
      ...config,
      preChatForm: {
        ...config.preChatForm,
        enabled
      }
    });
  };

  const handleSaveConfig = () => {
    if (onSave) {
      onSave(config);
    }
    
    toast({
      title: "Configuration saved",
      description: "Your chat widget configuration has been saved successfully."
    });
  };

  const handleResetConfig = () => {
    setConfig({
      ...defaultConfig,
      workspaceId: initialConfig.workspaceId || 'preview-mode'
    });
    
    toast({
      title: "Configuration reset",
      description: "Chat widget configuration has been reset to defaults."
    });
  };
  
  const togglePreview = () => {
    setPreviewVisible(!previewVisible);
  };

  return (
    <div className="preview-container grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Chat Widget Preview Settings</CardTitle>
          <CardDescription>Configure how your chat widget will appear to visitors</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="behavior">Behavior</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            
            <TabsContent value="appearance">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      id="primaryColor" 
                      type="color" 
                      value={config.branding?.primaryColor || '#8B5CF6'} 
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input 
                      value={config.branding?.primaryColor || '#8B5CF6'} 
                      onChange={(e) => handleColorChange(e.target.value)}
                      placeholder="#8B5CF6"
                      className="font-mono"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="position">Widget Position</Label>
                  <Select 
                    defaultValue={config.position?.placement || 'bottom-right'}
                    onValueChange={(value) => handlePositionChange(value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="top-left">Top Left</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="showBranding">Show "Powered by" branding</Label>
                  <Switch
                    id="showBranding"
                    checked={config.branding?.showBrandingBar !== false}
                    onCheckedChange={handleBrandingToggle}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="behavior">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="welcomeMessage">Welcome Message</Label>
                  <Input
                    id="welcomeMessage"
                    value={config.welcomeMessage}
                    onChange={(e) => handleWelcomeMessageChange(e.target.value)}
                    placeholder="Welcome! How can we help you today?"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="preChatForm">Pre-chat form</Label>
                  <Switch
                    id="preChatForm"
                    checked={config.preChatForm?.enabled !== false}
                    onCheckedChange={handlePreChatFormToggle}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="fileUpload">Allow file uploads</Label>
                  <Switch
                    id="fileUpload"
                    checked={config.features?.fileUpload !== false}
                    onCheckedChange={(checked) => setConfig({
                      ...config,
                      features: {
                        ...config.features,
                        fileUpload: checked
                      }
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="messageReactions">Enable message reactions</Label>
                  <Switch
                    id="messageReactions"
                    checked={config.features?.messageReactions !== false}
                    onCheckedChange={(checked) => setConfig({
                      ...config,
                      features: {
                        ...config.features,
                        messageReactions: checked
                      }
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="typingIndicators">Show typing indicators</Label>
                  <Switch
                    id="typingIndicators"
                    checked={config.features?.typingIndicators !== false}
                    onCheckedChange={(checked) => setConfig({
                      ...config,
                      features: {
                        ...config.features,
                        typingIndicators: checked
                      }
                    })}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 justify-between">
          <div className="flex w-full sm:w-auto space-x-2">
            <Button 
              variant="outline" 
              onClick={handleResetConfig}
              className="flex-1 sm:flex-initial"
            >
              Reset
            </Button>
            <Button 
              onClick={handleSaveConfig}
              className="flex-1 sm:flex-initial"
            >
              Save Configuration
            </Button>
          </div>
          <Button
            variant="secondary"
            onClick={togglePreview}
            className="w-full sm:w-auto mt-2 sm:mt-0"
          >
            {previewVisible ? "Hide Preview" : "Show Preview"}
          </Button>
        </CardFooter>
      </Card>
      
      <div className={`col-span-1 ${!previewVisible && 'hidden'} ${isMobile && 'h-[500px]'}`}>
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>This is how your chat widget will appear to your visitors</CardDescription>
          </CardHeader>
          
          <CardContent className="h-[calc(100%-10rem)] relative">
            <div className="absolute inset-0 border border-dashed border-gray-200 rounded-lg overflow-hidden">
              <div className="relative w-full h-full bg-gray-50">
                {/* The widget will render within this container */}
                {previewVisible && (
                  <ChatWidget 
                    workspaceId={config.workspaceId} 
                    previewConfig={config}
                    isPreviewMode={true}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PreviewWidget;
