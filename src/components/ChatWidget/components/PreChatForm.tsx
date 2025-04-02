
import React, { useState, useEffect, useCallback, memo } from 'react';
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

// Use memo to prevent unnecessary re-renders
const PreChatForm = memo(({ config, onFormComplete }: PreChatFormProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formValid, setFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input change for form
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
    setFormData(prev => ({ ...prev, [name]: sanitized }));
  }, [config.preChatForm.fields]);

  // Validate if the form is complete and valid
  useEffect(() => {
    if (!config.preChatForm.fields) return;
    
    const requiredFields = config.preChatForm.fields.filter(field => field.required);
    const allRequiredFilled = requiredFields.every(field => {
      const fieldValue = formData[field.name];
      return fieldValue && fieldValue.trim() !== '' && !validateField(field.name, fieldValue, true);
    });
    
    setFormValid(allRequiredFilled);
  }, [formData, config.preChatForm.fields]);

  // Submit form - using useCallback to prevent recreating this function
  const submitForm = useCallback(() => {
    if (!formValid || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      const sanitizedData = validateFormData(formData);
      
      // Dispatch form completion event
      if (config) { // Check config exists to prevent errors
        dispatchChatEvent('contact:formCompleted', { formData: sanitizedData }, config);
      }
      
      console.log("Form submission with data:", sanitizedData);
      onFormComplete(sanitizedData);
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsSubmitting(false);
    }
  }, [formValid, isSubmitting, formData, config, onFormComplete]);

  // Handle keyboard submission
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && formValid && !isSubmitting) {
      submitForm();
    }
  }, [formValid, isSubmitting, submitForm]);

  return (
    <div 
      className="bg-gray-50 p-4 rounded-lg mb-4 shadow-sm border border-gray-100"
      role="form"
      aria-labelledby="form-title"
      onKeyDown={handleKeyDown}
    >
      <p className="text-sm text-gray-600 mb-3" id="form-title">
        Please provide your information to continue:
      </p>
      {config.preChatForm.fields && config.preChatForm.fields.map((field) => (
        <div key={field.id} className="mb-3">
          <Label htmlFor={field.id} className="text-xs font-medium mb-1 block">
            {field.label}
            {field.required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
            {field.required && <span className="sr-only">(required)</span>}
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
            aria-describedby={formErrors[field.name] ? `${field.id}-error` : undefined}
            aria-invalid={!!formErrors[field.name]}
            disabled={isSubmitting}
          />
          {formErrors[field.name] && (
            <p 
              className="text-xs text-red-500 mt-1" 
              id={`${field.id}-error`}
              role="alert"
            >
              {formErrors[field.name]}
            </p>
          )}
        </div>
      ))}
      <Button 
        onClick={submitForm} 
        disabled={!formValid || isSubmitting}
        className="w-full h-8 text-sm mt-2"
        style={{
          backgroundColor: config.branding?.primaryColor || '#8B5CF6',
          borderColor: config.branding?.primaryColor || '#8B5CF6'
        }}
        aria-label="Start Chat"
      >
        {isSubmitting ? 'Starting chat...' : 'Start Chat'}
      </Button>
    </div>
  );
});

// Add display name for debugging
PreChatForm.displayName = 'PreChatForm';

export default PreChatForm;
