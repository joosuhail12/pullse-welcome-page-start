
import { useState, useCallback } from 'react';
import { Conversation } from '../types';

interface InlineFormResult {
  showInlineForm: boolean;
  setShowInlineForm: (show: boolean) => void;
  handleFormComplete: (formData: Record<string, string>) => void;
  formType: string;
  formConfig: Record<string, any>;
}

export const useInlineForm = (conversation: Conversation): InlineFormResult => {
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [formType, setFormType] = useState('contact');
  const [formConfig, setFormConfig] = useState<Record<string, any>>({
    title: 'Contact Information',
    fields: [
      { id: 'name', label: 'Name', type: 'text', required: true },
      { id: 'email', label: 'Email', type: 'email', required: true }
    ]
  });

  // Handle form completion
  const handleFormComplete = useCallback((formData: Record<string, string>) => {
    setShowInlineForm(false);
    
    // In a real implementation, this would update the conversation
    // via an API call and then update the local state
    console.log('Form submitted:', formData);
    
    // For now, we just hide the form
  }, []);
  
  return {
    showInlineForm,
    setShowInlineForm,
    handleFormComplete,
    formType,
    formConfig
  };
};
