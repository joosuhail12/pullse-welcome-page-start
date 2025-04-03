
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { validateField, validateFormData, sanitizeInput } from '../utils/validation';
import { dispatchChatEvent } from '../utils/events';
import { ChatWidgetConfig } from '../config';

interface PreChatFormProps {
  config: ChatWidgetConfig;
  onFormComplete: (formData: Record<string, string>) => void;
}

const PreChatForm = ({ config, onFormComplete }: PreChatFormProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formValid, setFormValid] = useState(false);

  // Handle input change for form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const field = config.preChatForm.fields.find(f => f.name === name);
    
    // Validate this specific field
    const error = field ? validateField(name, value, field.required || false) : null;
    
    // Update error state
    setFormErrors(prev => ({
      ...prev,
      [name]: error || ''
    }));
    
    // Sanitize input before storing
    const sanitized = sanitizeInput(value);
    const newFormData = { ...formData, [name]: sanitized };
    setFormData(newFormData);
    
    // Check if all required fields are valid
    validateFormCompletion(newFormData);
  };

  // Validate if the form is complete and valid
  const validateFormCompletion = (data: Record<string, string>) => {
    const requiredFields = config.preChatForm.fields.filter(field => field.required);
    const allRequiredFilled = requiredFields.every(field => {
      const fieldValue = data[field.name];
      return fieldValue && fieldValue.trim() !== '' && !validateField(field.name, fieldValue, true);
    });
    
    setFormValid(allRequiredFilled);
  };

  // Submit form
  const submitForm = () => {
    if (!formValid) return;
    
    const sanitizedData = validateFormData(formData);
    
    // Dispatch form completion event
    dispatchChatEvent('contact:formCompleted', { formData: sanitizedData }, config);
    
    // Pass data back to parent
    onFormComplete(sanitizedData);
  };

  // Compute form styles based on config
  const formStyle = {
    backgroundColor: config.branding?.primaryColor ? 'rgba(139, 92, 246, 0.05)' : 'bg-gray-50',
    borderColor: config.branding?.primaryColor || '#8B5CF6',
  };

  const labelStyle = {
    color: config.branding?.primaryColor || '#1f2937',
  };

  return (
    <div 
      className="bg-opacity-5 p-4 rounded-lg mb-4 shadow-sm border"
      style={formStyle}
    >
      <p className="text-sm text-gray-600 mb-3">
        Please provide your information to continue:
      </p>
      {config.preChatForm.fields.map((field) => (
        <div key={field.id} className="mb-3">
          <Label 
            htmlFor={field.id} 
            className="text-xs font-medium mb-1 block"
            style={{ color: labelStyle.color }}
          >
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
            className={`h-8 text-sm ${formErrors[field.name] ? 'border-red-500' : ''}`}
          />
          {formErrors[field.name] && (
            <p className="text-xs text-red-500 mt-1">{formErrors[field.name]}</p>
          )}
        </div>
      ))}
      <Button 
        onClick={submitForm} 
        disabled={!formValid}
        className="w-full h-8 text-sm mt-2"
        style={{
          backgroundColor: config.branding?.primaryColor || '#8B5CF6',
          borderColor: config.branding?.primaryColor || '#8B5CF6'
        }}
      >
        Start Chat
      </Button>
    </div>
  );
};

export default PreChatForm;

