
import React, { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChatWidgetConfig } from '../config';
import { FormDataStructure } from '../types';

interface PreChatFormProps {
  onFormComplete: (formData: FormDataStructure) => void;
  config?: ChatWidgetConfig;
}

type FieldType = 'text' | 'email' | 'tel' | 'url';

const PreChatForm: React.FC<PreChatFormProps> = ({
  onFormComplete,
  config
}) => {
  const [formState, setFormState] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get fields from config or use defaults
  const contactFields = config?.widgetfield?.[0]?.contactFields || [
    { type: 'email', label: 'Email', required: true, columnname: 'email', entityname: 'contact', placeholder: 'Enter Email' }
  ];
  
  const companyFields = config?.widgetfield?.[0]?.companyFields || [
    { type: 'text', label: 'Company Name', required: false, columnname: 'name', entityname: 'company', placeholder: 'Enter Company Name' }
  ];
  
  const customFields = config?.widgetfield?.[0]?.customDataFields || [];

  const validateField = (type: FieldType, value: string, required: boolean): string => {
    if (required && !value) {
      return 'This field is required';
    }
    
    if (value) {
      try {
        switch (type) {
          case 'email':
            z.string().email().parse(value);
            break;
          case 'tel':
            z.string().min(5).parse(value);
            break;
          case 'url':
            z.string().url().parse(value);
            break;
        }
      } catch (err) {
        return `Invalid ${type}`;
      }
    }
    
    return '';
  };

  const handleInputChange = (id: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: Record<string, string> = {};
    
    // Validate contact fields
    contactFields.forEach(field => {
      const error = validateField(
        field.type as FieldType, 
        formState[`contact-${field.columnname}`] || '', 
        !!field.required
      );
      if (error) {
        newErrors[`contact-${field.columnname}`] = error;
      }
    });
    
    // Validate company fields
    companyFields.forEach(field => {
      const error = validateField(
        field.type as FieldType, 
        formState[`company-${field.columnname}`] || '', 
        !!field.required
      );
      if (error) {
        newErrors[`company-${field.columnname}`] = error;
      }
    });
    
    // Validate custom fields
    customFields.forEach(field => {
      const error = validateField(
        field.type as FieldType, 
        formState[`custom-${field.columnname}`] || '', 
        !!field.required
      );
      if (error) {
        newErrors[`custom-${field.columnname}`] = error;
      }
    });
    
    setErrors(newErrors);
    
    // If no errors, submit the form
    if (Object.keys(newErrors).length === 0) {
      // Format the data for API submission
      const formData: FormDataStructure = {};
      
      // Format contact fields
      if (contactFields.length > 0) {
        formData.contact = contactFields.map(field => ({
          entityname: field.entityname,
          columnname: field.columnname,
          value: formState[`contact-${field.columnname}`] || '',
          type: field.type,
          label: field.label,
          required: !!field.required,
          placeholder: field.placeholder
        }));
      }
      
      // Format company fields
      if (companyFields.length > 0) {
        formData.company = companyFields.map(field => ({
          entityname: field.entityname,
          columnname: field.columnname,
          value: formState[`company-${field.columnname}`] || '',
          type: field.type,
          label: field.label,
          required: !!field.required,
          placeholder: field.placeholder
        }));
      }
      
      // Format custom fields
      if (customFields.length > 0) {
        formData.customData = customFields.map(field => ({
          entityname: field.entityname,
          columnname: field.columnname,
          value: formState[`custom-${field.columnname}`] || '',
          type: field.type,
          label: field.label,
          required: !!field.required,
          placeholder: field.placeholder || ''
        }));
      }
      
      onFormComplete(formData);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-4">
        {config?.labels?.welcomeTitle || 'Before we start chatting...'}
      </h2>
      <p className="text-gray-600 mb-6">
        {config?.labels?.welcomeSubtitle || 'Please provide your contact information:'}
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Contact fields */}
        {contactFields.map((field) => (
          <div key={`contact-${field.columnname}`}>
            <Label htmlFor={`contact-${field.columnname}`} className="mb-1 block">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={`contact-${field.columnname}`}
              type={field.type}
              placeholder={field.placeholder}
              value={formState[`contact-${field.columnname}`] || ''}
              onChange={(e) => handleInputChange(`contact-${field.columnname}`, e.target.value)}
              className={errors[`contact-${field.columnname}`] ? 'border-red-500' : ''}
            />
            {errors[`contact-${field.columnname}`] && (
              <p className="text-red-500 text-xs mt-1">{errors[`contact-${field.columnname}`]}</p>
            )}
          </div>
        ))}
        
        {/* Company fields */}
        {companyFields.map((field) => (
          <div key={`company-${field.columnname}`}>
            <Label htmlFor={`company-${field.columnname}`} className="mb-1 block">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={`company-${field.columnname}`}
              type={field.type}
              placeholder={field.placeholder}
              value={formState[`company-${field.columnname}`] || ''}
              onChange={(e) => handleInputChange(`company-${field.columnname}`, e.target.value)}
              className={errors[`company-${field.columnname}`] ? 'border-red-500' : ''}
            />
            {errors[`company-${field.columnname}`] && (
              <p className="text-red-500 text-xs mt-1">{errors[`company-${field.columnname}`]}</p>
            )}
          </div>
        ))}
        
        {/* Custom fields */}
        {customFields.map((field) => (
          <div key={`custom-${field.columnname}`}>
            <Label htmlFor={`custom-${field.columnname}`} className="mb-1 block">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={`custom-${field.columnname}`}
              type={field.type}
              placeholder={field.placeholder}
              value={formState[`custom-${field.columnname}`] || ''}
              onChange={(e) => handleInputChange(`custom-${field.columnname}`, e.target.value)}
              className={errors[`custom-${field.columnname}`] ? 'border-red-500' : ''}
            />
            {errors[`custom-${field.columnname}`] && (
              <p className="text-red-500 text-xs mt-1">{errors[`custom-${field.columnname}`]}</p>
            )}
          </div>
        ))}
        
        <Button type="submit" className="w-full">
          {config?.labels?.askQuestionButtonText || 'Start Chatting'}
        </Button>
      </form>
    </div>
  );
};

export default PreChatForm;
