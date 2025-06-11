
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Send } from 'lucide-react';

interface FormField {
  id: string;
  type: 'text' | 'email' | 'number' | 'select' | 'textarea';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

interface DataCollectionMessageProps {
  title?: string;
  description?: string;
  fields: FormField[];
  onSubmit: (data: Record<string, string>) => void;
  isSubmitted?: boolean;
  submittedData?: Record<string, string>;
}

const DataCollectionMessage: React.FC<DataCollectionMessageProps> = ({
  title = "Please provide the following information",
  description,
  fields,
  onSubmit,
  isSubmitted = false,
  submittedData = {}
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));

    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({
        ...prev,
        [fieldId]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    fields.forEach(field => {
      const value = formData[field.id] || '';
      
      if (field.required && !value.trim()) {
        newErrors[field.id] = `${field.label} is required`;
      } else if (field.type === 'email' && value && !isValidEmail(value)) {
        newErrors[field.id] = 'Please enter a valid email address';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const renderField = (field: FormField) => {
    const value = isSubmitted ? submittedData[field.id] || '' : formData[field.id] || '';
    const hasError = errors[field.id];

    if (isSubmitted) {
      return (
        <div key={field.id} className="space-y-1">
          <Label className="text-xs font-medium text-gray-600">{field.label}</Label>
          <div className="p-2 bg-green-50 border border-green-200 rounded-md text-sm text-gray-800">
            {value || 'Not provided'}
          </div>
        </div>
      );
    }

    switch (field.type) {
      case 'select':
        return (
          <div key={field.id} className="space-y-1">
            <Label htmlFor={field.id} className="text-xs font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select value={value} onValueChange={(val) => handleInputChange(field.id, val)}>
              <SelectTrigger className={`h-9 text-sm ${hasError ? 'border-red-500' : ''}`}>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option, index) => (
                  <SelectItem key={index} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError && <p className="text-xs text-red-500">{hasError}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-1">
            <Label htmlFor={field.id} className="text-xs font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={field.id}
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={`min-h-[80px] text-sm resize-none ${hasError ? 'border-red-500' : ''}`}
            />
            {hasError && <p className="text-xs text-red-500">{hasError}</p>}
          </div>
        );

      default:
        return (
          <div key={field.id} className="space-y-1">
            <Label htmlFor={field.id} className="text-xs font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.id}
              type={field.type}
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={`h-9 text-sm ${hasError ? 'border-red-500' : ''}`}
            />
            {hasError && <p className="text-xs text-red-500">{hasError}</p>}
          </div>
        );
    }
  };

  if (isSubmitted) {
    return (
      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-green-800">Information Submitted</h3>
        </div>
        
        <div className="space-y-3">
          {fields.map(field => renderField(field))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-800 text-sm mb-1">{title}</h3>
        {description && (
          <p className="text-xs text-gray-600">{description}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {fields.map(field => renderField(field))}

        <div className="pt-2">
          <Button 
            type="submit" 
            size="sm" 
            className="w-full h-9 text-sm font-medium"
          >
            <Send className="w-4 h-4 mr-2" />
            Submit Information
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DataCollectionMessage;
