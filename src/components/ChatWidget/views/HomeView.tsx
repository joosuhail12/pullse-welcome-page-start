import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { defaultConfig, PreChatFormField, ChatWidgetConfig } from '../config';
import AgentPresence from '../components/AgentPresence';
import { dispatchChatEvent } from '../utils/events';
import { validateFormData, sanitizeInput } from '../utils/validation';

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showForm, setShowForm] = useState(false);
  
  const validateField = (name: string, value: string, isRequired: boolean): string | null => {
    const sanitized = sanitizeInput(value);
    
    if (isRequired && !sanitized) {
      return "This field is required";
    }
    
    // Email validation
    if (name.toLowerCase().includes('email') && sanitized) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitized)) {
        return "Please enter a valid email address";
      }
    }
    
    // Phone validation (basic)
    if ((name.toLowerCase().includes('phone') || name.toLowerCase().includes('tel')) && sanitized) {
      const phoneRegex = /^\+?[0-9\s\-()]{6,20}$/;
      if (!phoneRegex.test(sanitized)) {
        return "Please enter a valid phone number";
      }
    }
    
    return null;
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const field = config.preChatForm.fields.find(f => f.name === name);
    
    // Validate this specific field
    const error = field ? validateField(name, value, field.required || false) : null;
    
    // Update error state
    setFieldErrors(prev => ({
      ...prev,
      [name]: error || ''
    }));
    
    // Sanitize input before storing
    const sanitized = sanitizeInput(value);
    const newFormData = { ...formData, [name]: sanitized };
    setFormData(newFormData);
    
    // Check if all required fields are valid
    const requiredFields = config.preChatForm.fields.filter(field => field.required);
    const allRequiredFilled = requiredFields.every(field => {
      const fieldValue = newFormData[field.name];
      return fieldValue && fieldValue.trim() !== '' && !validateField(field.name, fieldValue, true);
    });
    
    setFormValid(allRequiredFilled);
  };
  
  const renderFormFields = () => {
    const fields = config.preChatForm.fields;
    
    return (
      <div className="space-y-3 mt-3">
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
              className={`h-10 text-sm ${fieldErrors[field.name] ? 'border-red-500' : ''}`}
              aria-invalid={!!fieldErrors[field.name]}
            />
            {fieldErrors[field.name] && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors[field.name]}</p>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  const buttonStyle = config.branding?.primaryColor 
    ? { backgroundColor: config.branding.primaryColor, borderColor: config.branding.primaryColor }
    : {};
  
  return (
    <div className="flex flex-col p-5 h-full">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-vivid-purple-500">
          {config.welcomeMessage}
        </h2>
        
        {showForm && config.preChatForm.enabled && (
          <div className="mt-2">
            <p className="text-sm text-gray-600 leading-relaxed">
              Please provide your information to start the conversation:
            </p>
            {renderFormFields()}
          </div>
        )}
        
        {!showForm && (
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            Get help, ask questions, or start a conversation.
          </p>
        )}
        
        <AgentPresence />
      </div>
      
      <div className="mt-auto">
        <Button 
          onClick={() => {
            if (!showForm && config.preChatForm.enabled) {
              setShowForm(true);
              return;
            }
            
            if (config.preChatForm.enabled && formValid) {
              const sanitizedData = validateFormData(formData);
              dispatchChatEvent('contact:formCompleted', { formData: sanitizedData }, config);
              onStartChat(sanitizedData);
            } else if (!config.preChatForm.enabled) {
              onStartChat({});
            }
          }}
          disabled={config.preChatForm.enabled && showForm && !formValid}
          className="chat-widget-button flex items-center gap-2 w-full py-2.5"
          style={buttonStyle}
        >
          <MessageSquare size={18} />
          <span className="font-medium">
            {showForm ? 'Start Chat' : 'Ask a question'}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default HomeView;
