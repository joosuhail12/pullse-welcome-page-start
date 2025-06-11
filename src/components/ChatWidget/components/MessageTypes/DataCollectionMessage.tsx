
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, Send, Upload, X } from 'lucide-react';

interface FormField {
  id: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multi_select' | 'rich_text' | 'file_attachment' | 'currency' | 'url' | 'email' | 'phone' | 'textarea';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  currency?: string;
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
  const [fileUploads, setFileUploads] = useState<Record<string, File>>({});

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

  const handleFileChange = (fieldId: string, file: File | null) => {
    if (file) {
      setFileUploads(prev => ({
        ...prev,
        [fieldId]: file
      }));
      setFormData(prev => ({
        ...prev,
        [fieldId]: file.name
      }));
    } else {
      const { [fieldId]: removed, ...rest } = fileUploads;
      setFileUploads(rest);
      setFormData(prev => ({
        ...prev,
        [fieldId]: ''
      }));
    }
  };

  const handleMultiSelectChange = (fieldId: string, value: string) => {
    const currentValues = formData[fieldId] ? formData[fieldId].split(',') : [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    handleInputChange(fieldId, newValues.join(','));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    fields.forEach(field => {
      const value = formData[field.id] || '';
      
      if (field.required && !value.trim()) {
        newErrors[field.id] = `${field.label} is required`;
      } else if (field.type === 'email' && value && !isValidEmail(value)) {
        newErrors[field.id] = 'Please enter a valid email address';
      } else if (field.type === 'url' && value && !isValidURL(value)) {
        newErrors[field.id] = 'Please enter a valid URL';
      } else if (field.type === 'phone' && value && !isValidPhone(value)) {
        newErrors[field.id] = 'Please enter a valid phone number';
      } else if (field.type === 'number' && value && isNaN(Number(value))) {
        newErrors[field.id] = 'Please enter a valid number';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidURL = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isValidPhone = (phone: string) => {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
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
            {field.type === 'boolean' ? (value === 'true' ? 'Yes' : 'No') : (value || 'Not provided')}
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

      case 'multi_select':
        const selectedValues = value ? value.split(',') : [];
        return (
          <div key={field.id} className="space-y-1">
            <Label className="text-xs font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="space-y-2 p-3 border rounded-md">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}-${index}`}
                    checked={selectedValues.includes(option)}
                    onCheckedChange={() => handleMultiSelectChange(field.id, option)}
                  />
                  <Label htmlFor={`${field.id}-${index}`} className="text-sm">{option}</Label>
                </div>
              ))}
            </div>
            {hasError && <p className="text-xs text-red-500">{hasError}</p>}
          </div>
        );

      case 'boolean':
        return (
          <div key={field.id} className="space-y-1">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={field.id}
                checked={value === 'true'}
                onCheckedChange={(checked) => handleInputChange(field.id, checked ? 'true' : 'false')}
              />
              <Label htmlFor={field.id} className="text-xs font-medium">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </Label>
            </div>
            {hasError && <p className="text-xs text-red-500">{hasError}</p>}
          </div>
        );

      case 'rich_text':
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

      case 'file_attachment':
        return (
          <div key={field.id} className="space-y-1">
            <Label htmlFor={field.id} className="text-xs font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id={field.id}
                type="file"
                onChange={(e) => handleFileChange(field.id, e.target.files?.[0] || null)}
                className={`h-9 text-sm ${hasError ? 'border-red-500' : ''}`}
              />
              {fileUploads[field.id] && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleFileChange(field.id, null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            {hasError && <p className="text-xs text-red-500">{hasError}</p>}
          </div>
        );

      case 'currency':
        return (
          <div key={field.id} className="space-y-1">
            <Label htmlFor={field.id} className="text-xs font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                {field.currency || '$'}
              </span>
              <Input
                id={field.id}
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className={`pl-8 h-9 text-sm ${hasError ? 'border-red-500' : ''}`}
              />
            </div>
            {hasError && <p className="text-xs text-red-500">{hasError}</p>}
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className="space-y-1">
            <Label htmlFor={field.id} className="text-xs font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.id}
              type="date"
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className={`h-9 text-sm ${hasError ? 'border-red-500' : ''}`}
            />
            {hasError && <p className="text-xs text-red-500">{hasError}</p>}
          </div>
        );

      case 'number':
        return (
          <div key={field.id} className="space-y-1">
            <Label htmlFor={field.id} className="text-xs font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.id}
              type="number"
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={`h-9 text-sm ${hasError ? 'border-red-500' : ''}`}
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
              type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : field.type === 'phone' ? 'tel' : 'text'}
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
