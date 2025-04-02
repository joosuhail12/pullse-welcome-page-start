
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

// Use memo to prevent unnecessary re-renders
const PreChatForm = memo(({ config, onFormComplete, isProcessingForm = false }: PreChatFormProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formValid, setFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitAttemptedRef = useRef(false);
  const formSubmittedRef = useRef(false);
  
  // Reset submission state when isProcessingForm changes to false
  useEffect(() => {
    if (!isProcessingForm && formSubmittedRef.current) {
      // Reset state only if previously submitted
      submitAttemptedRef.current = false;
    }
  }, [isProcessingForm]);

  // Handle input change for form with validation
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const field = config.preChatForm.fields.find(f => f.name === name);
    
    // Validate this specific field
    const error = field ? validateField(name, value, field.required || false) : null;
    
    // Update error and form data state
    setFormErrors(prev => ({
      ...prev,
      [name]: error || ''
    }));
    
    setFormData(prev => ({ ...prev, [name]: value }));
  }, [config.preChatForm.fields]);

  // Form validation effect
  useEffect(() => {
    if (!config.preChatForm.fields) return;
    
    const requiredFields = config.preChatForm.fields.filter(field => field.required);
    const allRequiredFilled = requiredFields.every(field => {
      const fieldValue = formData[field.name];
      return fieldValue && fieldValue.trim() !== '' && !formErrors[field.name];
    });
    
    setFormValid(allRequiredFilled);
  }, [formData, formErrors, config.preChatForm.fields]);

  // Submit form with improved state handling
  const submitForm = useCallback(() => {
    // Multiple checks to prevent duplicate submissions
    if (!formValid || isProcessingForm || isSubmitting || formSubmittedRef.current) {
      console.log('Form submission prevented:', { 
        formValid, 
        isProcessingForm, 
        isSubmitting,
        formSubmitted: formSubmittedRef.current
      });
      return;
    }
    
    // Set submission flags
    submitAttemptedRef.current = true;
    formSubmittedRef.current = true;
    setIsSubmitting(true);
    
    try {
      console.log("Validating form data before submission");
      const sanitizedData = validateFormData(formData);
      console.log("Form submission with data:", sanitizedData);
      
      // Call the callback with validated data
      onFormComplete(sanitizedData);
    } catch (error) {
      console.error("Error submitting form:", error);
      // Reset only the state flag but keep the ref to prevent repeated submissions
      setIsSubmitting(false);
    }
  }, [formValid, isProcessingForm, isSubmitting, formData, onFormComplete]);

  // Handle keyboard submission
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && formValid && !isSubmitting && !isProcessingForm && !formSubmittedRef.current) {
      submitForm();
    }
  }, [formValid, isSubmitting, isProcessingForm, submitForm]);

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
            disabled={isSubmitting || isProcessingForm || formSubmittedRef.current}
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
        disabled={!formValid || isSubmitting || isProcessingForm || formSubmittedRef.current}
        className="w-full h-8 text-sm mt-2"
        style={{
          backgroundColor: config.branding?.primaryColor || '#8B5CF6',
          borderColor: config.branding?.primaryColor || '#8B5CF6'
        }}
        aria-label="Start Chat"
      >
        {isSubmitting || isProcessingForm ? 'Starting chat...' : 'Start Chat'}
      </Button>
    </div>
  );
});

// Add display name for debugging
PreChatForm.displayName = 'PreChatForm';

export default PreChatForm;
