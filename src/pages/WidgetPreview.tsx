
import React, { useState } from 'react';
import PreviewWidget from '../components/ChatWidget/preview/PreviewWidget';
import EmbedCodeGenerator from '../components/ChatWidget/preview/EmbedCodeGenerator';
import { ChatWidgetConfig } from '../components/ChatWidget/config';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const WidgetPreview: React.FC = () => {
  // Load saved config from localStorage if available
  const initialConfig = React.useMemo(() => {
    const saved = localStorage.getItem('pullse-widget-config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved config:', e);
      }
    }
    return {};
  }, []);

  const [currentConfig, setCurrentConfig] = useState<ChatWidgetConfig>(initialConfig as ChatWidgetConfig);

  const handleSaveConfig = (config: ChatWidgetConfig) => {
    console.log('Configuration saved:', config);
    
    // Update the current config state
    setCurrentConfig(config);
    
    // In a real application, this would save to backend or localStorage
    localStorage.setItem('pullse-widget-config', JSON.stringify(config));
    
    toast({
      title: "Configuration saved",
      description: "Your settings have been saved and are ready to be deployed."
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Widget Preview</h1>
      <p className="text-gray-500 mb-6">
        Customize your chat widget and see the changes in real-time before going live
      </p>
      
      <Tabs defaultValue="preview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="preview">Preview & Configure</TabsTrigger>
          <TabsTrigger value="embed">Get Embed Code</TabsTrigger>
        </TabsList>
        
        <TabsContent value="preview">
          <PreviewWidget 
            onSave={handleSaveConfig}
            initialConfig={initialConfig}
          />
          
          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h3 className="text-amber-800 font-medium">How to use this preview</h3>
            <p className="text-amber-700 mt-2">
              Make changes to the widget settings on the left panel and watch them take effect in 
              real-time in the preview on the right. When you're satisfied with your configuration, 
              click "Save Configuration" to use these settings in your live widget.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="embed">
          <div className="grid grid-cols-1 gap-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Embed Your Chat Widget</h2>
              <p className="text-gray-600">
                Once you've configured your chat widget, you can add it to your website by 
                copying and pasting the code below into your HTML.
              </p>
            </div>
            
            <EmbedCodeGenerator config={currentConfig} />
            
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-blue-800 font-medium">Installation Tips</h3>
              <ul className="list-disc list-inside text-blue-700 mt-2 space-y-1">
                <li>Add this code just before the closing &lt;/body&gt; tag of your website.</li>
                <li>The widget will automatically load when your page loads.</li>
                <li>You can update your configuration anytime by coming back to this page.</li>
                <li>Testing on multiple devices is recommended to ensure the widget looks good on all screen sizes.</li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WidgetPreview;
