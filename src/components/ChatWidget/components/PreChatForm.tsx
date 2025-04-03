
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { validateField, validateFormData, sanitizeInput } from '../utils/validation';
import { dispatchChatEvent } from '../utils/events';
import { ChatWidgetConfig } from '../config';
import { User, AtSign } from 'lucide-react';

interface PreChatFormProps {
  config: ChatWidgetConfig;
  onFormComplete: (formData: Record<string, string>) => void;
}

const PreChatForm = ({ config, onFormComplete }: PreChatFormProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formValid, setFormValid] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Handle input change for form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const field = config.preChatForm.fields.find(f => f.name === name);
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
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

  // Compute primary color based on config or fallback
  const primaryColor = config.branding?.primaryColor || '#8B5CF6';

  // Handle blur event to mark field as touched
  const handleBlur = (field: string) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  // Get icon for input field
  const getFieldIcon = (fieldName: string) => {
    if (fieldName === 'name') return <User className="text-gray-400 w-4 h-4" />;
    if (fieldName === 'email') return <AtSign className="text-gray-400 w-4 h-4" />;
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-4 border border-gray-100 animate-fade-in">
      <h3 className="text-center font-semibold mb-4 text-gray-700">
        {config.preChatForm.title || 'Please provide your information to continue'}
      </h3>
      
      <div className="space-y-4">
        {config.preChatForm.fields.map((field) => (
          <div key={field.id} className="space-y-1">
            <Label 
              htmlFor={field.id} 
              className="text-sm font-medium flex items-center gap-1"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                {getFieldIcon(field.name)}
              </div>
              
              <Input
                id={field.id}
                name={field.name}
                type={field.type}
                required={field.required}
                placeholder={field.placeholder}
                value={formData[field.name] || ''}
                onChange={handleInputChange}
                onBlur={() => handleBlur(field.name)}
                className={`pl-10 h-10 transition-all ${
                  touched[field.name] && formErrors[field.name] 
                    ? 'border-red-500 bg-red-50' 
                    : touched[field.name] && !formErrors[field.name]
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200'
                }`}
                aria-describedby={formErrors[field.name] ? `${field.id}-error` : undefined}
              />
            </div>
            
            {touched[field.name] && formErrors[field.name] && (
              <p 
                id={`${field.id}-error`} 
                className="text-xs text-red-500 mt-1 animate-fade-in"
              >
                {formErrors[field.name]}
              </p>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <Button 
          onClick={submitForm} 
          disabled={!formValid}
          className="w-full h-11 text-white transition-all"
          style={{
            backgroundColor: primaryColor,
            opacity: formValid ? 1 : 0.7
          }}
        >
          Start Chat
        </Button>
        
        <p className="text-xs text-center text-gray-500 mt-3">
          Your information helps us provide better assistance
        </p>
      </div>
    </div>
  );
};

export default PreChatForm;
