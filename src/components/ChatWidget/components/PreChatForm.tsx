
import React, { useState, useCallback, memo, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { validateField, validateFormData } from '../utils/formUtils';
import { ChatWidgetConfig } from '../config';

interface PreChatFormProps {
  config: ChatWidgetConfig;
  onFormComplete: (formData: Record<string, string>) => void;
  isProcessingForm?: boolean;
}

const PreChatForm = memo(({ config, onFormComplete, isProcessingForm = false }: PreChatFormProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formValid, setFormValid] = useState(false);
  
  // Use refs to track submission state
  const formSubmittedRef = useRef(false);
  const submitAttemptedRef = useRef(false);
  
  // Reset form submitted state when processing state changes
  useEffect(() => {
    if (!isProcessingForm) {
      formSubmittedRef.current = false;
    }
  }, [isProcessingForm]);
  
  // Handle input change with stable references
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (formSubmittedRef.current) return;
    
    const { name, value } = e.target;
    const field = config.preChatForm.fields.find(f => f.name === name);
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      return newData;
    });
    
    // Validate field in a separate effect to avoid render loops
    if (field) {
      const error = validateField(name, value, field.required || false);
      setFormErrors(prevErrors => ({
        ...prevErrors,
        [name]: error || ''
      }));
    }
  }, [config.preChatForm.fields]);
  
  // Validate the entire form whenever form data changes
  useEffect(() => {
    const requiredFields = config.preChatForm.fields.filter(field => field.required);
    const allRequiredFilled = requiredFields.every(field => {
      const fieldValue = formData[field.name];
      return fieldValue && fieldValue.trim() !== '';
    });
    
    const hasErrors = Object.values(formErrors).some(Boolean);
    setFormValid(allRequiredFilled && !hasErrors);
  }, [config.preChatForm.fields, formData, formErrors]);

  // Submit form with better guards against multiple submissions
  const submitForm = useCallback(() => {
    if (!formValid || isProcessingForm || formSubmittedRef.current) {
      return;
    }
    
    submitAttemptedRef.current = true;
    formSubmittedRef.current = true;
    
    try {
      const sanitizedData = validateFormData(formData);
      onFormComplete(sanitizedData);
    } catch (error) {
      console.error("Error submitting form:", error);
      formSubmittedRef.current = false;
    }
  }, [formValid, isProcessingForm, formData, onFormComplete]);

  // Handle keyboard submission
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && formValid && !isProcessingForm && !formSubmittedRef.current) {
      submitForm();
    }
  }, [formValid, isProcessingForm, submitForm]);

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
            disabled={isProcessingForm || formSubmittedRef.current}
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
        disabled={!formValid || isProcessingForm || formSubmittedRef.current}
        className="w-full h-8 text-sm mt-2"
        style={{
          backgroundColor: config.branding?.primaryColor || '#8B5CF6',
          borderColor: config.branding?.primaryColor || '#8B5CF6'
        }}
        aria-label="Start Chat"
      >
        {isProcessingForm ? 'Starting chat...' : 'Start Chat'}
      </Button>
    </div>
  );
});

PreChatForm.displayName = 'PreChatForm';

export default PreChatForm;
