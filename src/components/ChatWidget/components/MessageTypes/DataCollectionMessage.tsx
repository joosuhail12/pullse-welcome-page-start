
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, Send, Upload, X, AlertCircle, Calendar, DollarSign, Mail, Phone, Link2, Hash, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        onSubmit(formData);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-3.5 h-3.5 text-muted-foreground" />;
      case 'phone': return <Phone className="w-3.5 h-3.5 text-muted-foreground" />;
      case 'url': return <Link2 className="w-3.5 h-3.5 text-muted-foreground" />;
      case 'number': return <Hash className="w-3.5 h-3.5 text-muted-foreground" />;
      case 'currency': return <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />;
      case 'date': return <Calendar className="w-3.5 h-3.5 text-muted-foreground" />;
      case 'textarea':
      case 'rich_text': return <FileText className="w-3.5 h-3.5 text-muted-foreground" />;
      case 'file_attachment': return <Upload className="w-3.5 h-3.5 text-muted-foreground" />;
      default: return null;
    }
  };

  const renderField = (field: FormField) => {
    const value = isSubmitted ? submittedData[field.id] || '' : formData[field.id] || '';
    const hasError = errors[field.id];

    if (isSubmitted) {
      return (
        <div key={field.id} className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {getFieldIcon(field.type)}
            <span>{field.label}</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg text-sm">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-green-700">
              {field.type === 'boolean' ? (value === 'true' ? 'Yes' : 'No') : (value || 'Not provided')}
            </span>
          </div>
        </div>
      );
    }

    const baseInputClasses = cn(
      "h-9 text-sm border border-border focus:border-primary focus:ring-1 focus:ring-primary",
      "rounded-md bg-background transition-colors",
      hasError && "border-red-400 focus:border-red-500 focus:ring-red-500"
    );

    switch (field.type) {
      case 'select':
        return (
          <div key={field.id} className="space-y-1">
            <Label htmlFor={field.id} className="text-xs font-medium flex items-center gap-2">
              {getFieldIcon(field.type)}
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select value={value} onValueChange={(val) => handleInputChange(field.id, val)}>
              <SelectTrigger className={baseInputClasses}>
                <SelectValue placeholder={field.placeholder || `Choose ${field.label.toLowerCase()}...`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {hasError}
              </p>
            )}
          </div>
        );

      case 'multi_select':
        const selectedValues = value ? value.split(',') : [];
        return (
          <div key={field.id} className="space-y-2">
            <Label className="text-xs font-medium flex items-center gap-2">
              {getFieldIcon(field.type)}
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="space-y-2 p-3 border border-border rounded-md bg-background/50">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}-${index}`}
                    checked={selectedValues.includes(option)}
                    onCheckedChange={() => handleMultiSelectChange(field.id, option)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor={`${field.id}-${index}`} className="text-xs cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            {hasError && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {hasError}
              </p>
            )}
          </div>
        );

      case 'boolean':
        return (
          <div key={field.id} className="space-y-1">
            <div className="flex items-center space-x-2 p-2 border border-border rounded-md bg-background/50">
              <Checkbox
                id={field.id}
                checked={value === 'true'}
                onCheckedChange={(checked) => handleInputChange(field.id, checked ? 'true' : 'false')}
                className="w-4 h-4"
              />
              <Label htmlFor={field.id} className="text-xs font-medium cursor-pointer">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </Label>
            </div>
            {hasError && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {hasError}
              </p>
            )}
          </div>
        );

      case 'rich_text':
      case 'textarea':
        return (
          <div key={field.id} className="space-y-1">
            <Label htmlFor={field.id} className="text-xs font-medium flex items-center gap-2">
              {getFieldIcon(field.type)}
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={field.id}
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={cn(baseInputClasses, "min-h-[80px] resize-none")}
            />
            {hasError && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {hasError}
              </p>
            )}
          </div>
        );

      case 'file_attachment':
        return (
          <div key={field.id} className="space-y-1">
            <Label htmlFor={field.id} className="text-xs font-medium flex items-center gap-2">
              {getFieldIcon(field.type)}
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id={field.id}
                type="file"
                onChange={(e) => handleFileChange(field.id, e.target.files?.[0] || null)}
                className={cn(baseInputClasses, "file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-primary/10 file:text-primary file:text-xs")}
              />
              {fileUploads[field.id] && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleFileChange(field.id, null)}
                  className="h-9 px-2"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
            {fileUploads[field.id] && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 p-2 rounded border">
                <Upload className="w-3 h-3" />
                <span>{fileUploads[field.id].name}</span>
              </div>
            )}
            {hasError && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {hasError}
              </p>
            )}
          </div>
        );

      case 'currency':
        return (
          <div key={field.id} className="space-y-1">
            <Label htmlFor={field.id} className="text-xs font-medium flex items-center gap-2">
              {getFieldIcon(field.type)}
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                {field.currency || '$'}
              </span>
              <Input
                id={field.id}
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className={cn(baseInputClasses, "pl-8")}
              />
            </div>
            {hasError && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {hasError}
              </p>
            )}
          </div>
        );

      default:
        return (
          <div key={field.id} className="space-y-1">
            <Label htmlFor={field.id} className="text-xs font-medium flex items-center gap-2">
              {getFieldIcon(field.type)}
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.id}
              type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : field.type === 'phone' ? 'tel' : field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={baseInputClasses}
              step={field.type === 'number' ? '0.01' : undefined}
            />
            {hasError && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {hasError}
              </p>
            )}
          </div>
        );
    }
  };

  if (isSubmitted) {
    return (
      <div className="p-4 bg-green-50/80 border border-green-200 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <h3 className="text-sm font-semibold text-green-800">Information Submitted</h3>
        </div>
        <div className="space-y-3">
          {fields.map(field => renderField(field))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-background border border-border rounded-lg shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {fields.map(field => renderField(field))}

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full h-9 text-sm mt-4"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
              <span>Submitting...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Send className="w-3.5 h-3.5" />
              <span>Submit Information</span>
            </div>
          )}
        </Button>
      </form>
    </div>
  );
};

export default DataCollectionMessage;
