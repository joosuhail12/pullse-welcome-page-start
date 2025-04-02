
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { defaultConfig, PreChatFormField, ChatWidgetConfig } from '../config';
import AgentPresence from '../components/AgentPresence';
import { dispatchChatEvent } from '../utils/events';

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
    if (config.preChatForm.enabled && formValid) {
      // Dispatch form completion event before starting chat
      dispatchChatEvent('contact:formCompleted', { formData }, config);
    }
    
    onStartChat(formData);
  };

  const renderFormFields = () => {
    // Calculate grid columns based on field count
    const fields = config.preChatForm.fields;
    const gridCols = fields.length > 2 ? 'grid-cols-2' : 'grid-cols-1';
    
    return (
      <div className={`grid ${gridCols} gap-4 mb-5`}>
        {fields.map((field: PreChatFormField) => (
          <div key={field.id} className="space-y-1.5">
            <Label htmlFor={field.id} className="text-sm font-medium">
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
              className="h-10 text-sm"
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
  
  return (
    <div className="flex flex-col p-5 h-full">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-vivid-purple-500">
          {config.welcomeMessage}
        </h2>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
          Get help, ask questions, or start a conversation.
        </p>
        
        <AgentPresence />
      </div>
      
      {config.preChatForm.enabled && renderFormFields()}
      
      <div className="mt-auto">
        <Button 
          onClick={handleStartChat}
          disabled={config.preChatForm.enabled && !formValid}
          className="chat-widget-button flex items-center gap-2 w-full py-2.5"
          style={buttonStyle}
        >
          <MessageSquare size={18} />
          <span className="font-medium">Ask a question</span>
        </Button>
      </div>
    </div>
  );
};

export default HomeView;
