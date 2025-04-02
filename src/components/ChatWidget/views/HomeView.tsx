
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { defaultConfig, PreChatFormField, ChatWidgetConfig } from '../config';
import AgentPresence from '../components/AgentPresence';

interface HomeViewProps {
  onStartChat: (formData?: Record<string, string>) => void;
  config?: ChatWidgetConfig;
}

const HomeView = ({ 
  onStartChat, 
  config = defaultConfig 
}: HomeViewProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formValid, setFormValid] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    
    // Check if all required fields are filled
    const requiredFields = config.preChatForm.fields.filter(field => field.required);
    const allRequiredFilled = requiredFields.every(field => 
      newFormData[field.name] && newFormData[field.name].trim() !== ''
    );
    
    setFormValid(allRequiredFilled);
  };
  
  const handleStartChat = () => {
    onStartChat(formData);
  };

  const renderFormFields = () => {
    // Calculate grid columns based on field count
    const fields = config.preChatForm.fields;
    const gridCols = fields.length > 2 ? 'grid-cols-2' : 'grid-cols-1';
    
    return (
      <div className={`grid ${gridCols} gap-3 mb-4`}>
        {fields.map((field: PreChatFormField) => (
          <div key={field.id} className="space-y-1">
            <Label htmlFor={field.id} className="text-xs">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              name={field.name}
              type={field.type}
              required={field.required}
              placeholder={field.placeholder}
              value={formData[field.name] || ''}
              onChange={handleInputChange}
              className="h-8 text-sm"
            />
          </div>
        ))}
      </div>
    );
  };
  
  // Apply custom branding if available
  const buttonStyle = config.branding?.primaryColor 
    ? { backgroundColor: config.branding.primaryColor, borderColor: config.branding.primaryColor }
    : {};
  const fontStyle = config.branding?.fontFamily 
    ? { fontFamily: config.branding.fontFamily }
    : {};
  
  return (
    <div className="flex flex-col p-4 h-full" style={fontStyle}>
      <div className="mb-3">
        <h2 className="text-xl font-bold text-vivid-purple">
          {config.welcomeMessage}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Get help, ask questions, or start a conversation.
        </p>
        
        <AgentPresence />
      </div>
      
      {config.preChatForm.enabled && renderFormFields()}
      
      <div className="flex-grow flex flex-col justify-end">
        <Button 
          onClick={handleStartChat}
          disabled={config.preChatForm.enabled && !formValid}
          className="bg-vivid-purple hover:bg-vivid-purple/90 flex items-center gap-2 w-full"
          style={buttonStyle}
        >
          <MessageSquare size={18} />
          <span>Ask a question</span>
        </Button>
      </div>
      
      {/* Render branding bar if enabled */}
      {config.branding?.showBrandingBar && (
        <div className="mt-3 pt-3 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">Powered by Pullse</p>
        </div>
      )}
    </div>
  );
};

export default HomeView;
