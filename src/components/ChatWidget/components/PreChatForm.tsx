
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChatWidgetConfig } from '../config';

interface PreChatFormProps {
  config: ChatWidgetConfig;
  onFormComplete: (formData: Record<string, string>) => void;
  testMode?: boolean;
}

const PreChatForm: React.FC<PreChatFormProps> = ({ 
  config, 
  onFormComplete,
  testMode = false
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    if (config.preChatForm?.fields) {
      config.preChatForm.fields.forEach(field => {
        if (field.required && !formData[field.id]) {
          newErrors[field.id] = `${field.label} is required`;
          isValid = false;
        }
        
        // Email validation
        if (field.type === 'email' && formData[field.id] && !validateEmail(formData[field.id])) {
          newErrors[field.id] = 'Please enter a valid email address';
          isValid = false;
        }
      });
    }
    
    if (!isValid) {
      setErrors(newErrors);
      return;
    }
    
    // Add a test flag if in test mode
    const finalFormData = testMode 
      ? { ...formData, _testMode: 'true' } 
      : formData;
      
    onFormComplete(finalFormData);
  };
  
  // Simple email validation
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {testMode && (
        <div className="p-2 bg-orange-100 rounded-md text-xs text-orange-800 mb-3">
          <strong>Test Mode:</strong> Form submissions will not be sent to any real systems.
        </div>
      )}
      
      {config.preChatForm?.title && (
        <h3 className="text-lg font-medium">{config.preChatForm.title}</h3>
      )}
      
      {config.preChatForm?.description && (
        <p className="text-gray-600 text-sm">{config.preChatForm.description}</p>
      )}
      
      <div className="space-y-3">
        {config.preChatForm?.fields?.map(field => (
          <div key={field.id}>
            <Label htmlFor={field.id} className="text-sm">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.id}
              name={field.id}
              type={field.type}
              placeholder={field.placeholder}
              value={formData[field.id] || ''}
              onChange={handleChange}
              className={errors[field.id] ? 'border-red-300' : ''}
            />
            {errors[field.id] && (
              <p className="text-red-500 text-xs mt-1">{errors[field.id]}</p>
            )}
          </div>
        ))}
      </div>
      
      <div className="pt-2">
        <Button type="submit" className="w-full">
          {config.preChatForm?.submitButtonText || 'Start Chat'}
        </Button>
      </div>
    </form>
  );
};

export default PreChatForm;
