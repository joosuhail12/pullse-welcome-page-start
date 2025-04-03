
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatWidgetConfig } from '../config';
import { useToast } from "@/hooks/use-toast";

interface EmbedCodeGeneratorProps {
  config: ChatWidgetConfig;
}

const EmbedCodeGenerator: React.FC<EmbedCodeGeneratorProps> = ({ config }) => {
  const [embedCode, setEmbedCode] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    generateEmbedCode(config);
  }, [config]);

  const generateEmbedCode = (config: ChatWidgetConfig) => {
    // Extract only the necessary properties for embedding
    const embedConfig = {
      workspaceId: config.workspaceId,
      welcomeMessage: config.welcomeMessage,
      primaryColor: config.branding?.primaryColor,
      position: config.position?.placement,
      hideBranding: !config.branding?.showBrandingBar,
      // Include other properties that should be configurable from the embed code
    };

    const code = `<script>
  (function(w,d,s,o,f,js,fjs){
    w['PullseWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;js.parentNode.insertBefore(js,fjs);
  }(window,document,'script','pullse','https://cdn.pullse.io/embed.js'));
  
  pullse('init', { 
    workspaceId: '${embedConfig.workspaceId}',
    welcomeMessage: '${embedConfig.welcomeMessage}',
    primaryColor: '${embedConfig.primaryColor}',
    position: '${embedConfig.position}',
    ${embedConfig.hideBranding ? 'hideBranding: true,' : ''}
  });
</script>`;

    setEmbedCode(code);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode)
      .then(() => {
        toast({
          title: "Copied!",
          description: "Embed code has been copied to clipboard."
        });
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        toast({
          title: "Failed to copy",
          description: "Please try selecting and copying the code manually.",
          variant: "destructive"
        });
      });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Embed Code</CardTitle>
        <CardDescription>Add this code to your website to embed the chat widget</CardDescription>
      </CardHeader>
      
      <CardContent>
        <Textarea
          value={embedCode}
          readOnly
          className="font-mono text-sm h-40"
        />
      </CardContent>
      
      <CardFooter>
        <Button onClick={copyToClipboard}>
          Copy Code
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EmbedCodeGenerator;
