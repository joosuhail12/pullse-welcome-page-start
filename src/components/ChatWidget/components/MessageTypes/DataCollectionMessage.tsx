
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, Send, Upload, X, AlertCircle, Calendar, DollarSign, Mail, Phone, Link2, Hash, FileText, ChevronDown } from 'lucide-react';
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
    const iconClass = "w-4 h-4 text-gray-400";
    switch (type) {
      case 'email': return <Mail className={iconClass} />;
      case 'phone': return <Phone className={iconClass} />;
      case 'url': return <Link2 className={iconClass} />;
      case 'number': return <Hash className={iconClass} />;
      case 'currency': return <DollarSign className={iconClass} />;
      case 'date': return <Calendar className={iconClass} />;
      case 'textarea':
      case 'rich_text': return <FileText className={iconClass} />;
      case 'file_attachment': return <Upload className={iconClass} />;
      default: return null;
    }
  };

  const renderField = (field: FormField) => {
    const value = isSubmitted ? submittedData[field.id] || '' : formData[field.id] || '';
    const hasError = errors[field.id];

    if (isSubmitted) {
      return (
        <div key={field.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            {getFieldIcon(field.type)}
            <span className="font-medium">{field.label}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-gray-900 font-medium">
              {field.type === 'boolean' ? (value === 'true' ? 'Yes' : 'No') : (value || 'Not provided')}
            </span>
          </div>
        </div>
      );
    }

    const inputClasses = cn(
      "w-full h-10 px-3 py-2 text-sm border border-gray-200 rounded-lg",
      "bg-white placeholder:text-gray-400",
      "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
      "transition-all duration-200",
      hasError && "border-red-300 focus:ring-red-500/20 focus:border-red-500"
    );

    switch (field.type) {
      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <div className="flex items-center gap-3">
              {getFieldIcon(field.type)}
              <Label htmlFor={field.id} className="text-sm font-medium text-gray-700 flex-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
            <Select value={value} onValueChange={(val) => handleInputChange(field.id, val)}>
              <SelectTrigger className={inputClasses}>
                <SelectValue placeholder={field.placeholder || "Select an option"} />
                <ChevronDown className="w-4 h-4 opacity-50" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                {field.options?.map((option, index) => (
                  <SelectItem key={index} value={option} className="hover:bg-gray-50">
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
          <div key={field.id} className="space-y-3">
            <div className="flex items-center gap-3">
              {getFieldIcon(field.type)}
              <Label className="text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <Checkbox
                    id={`${field.id}-${index}`}
                    checked={selectedValues.includes(option)}
                    onCheckedChange={() => handleMultiSelectChange(field.id, option)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor={`${field.id}-${index}`} className="text-sm text-gray-700 cursor-pointer flex-1">
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
          <div key={field.id} className="space-y-2">
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <Checkbox
                id={field.id}
                checked={value === 'true'}
                onCheckedChange={(checked) => handleInputChange(field.id, checked ? 'true' : 'false')}
                className="w-4 h-4"
              />
              <Label htmlFor={field.id} className="text-sm font-medium cursor-pointer text-gray-700 flex-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
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
          <div key={field.id} className="space-y-2">
            <div className="flex items-center gap-3">
              {getFieldIcon(field.type)}
              <Label htmlFor={field.id} className="text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
            <Textarea
              id={field.id}
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={cn(
                "min-h-[80px] resize-none text-sm border border-gray-200 rounded-lg",
                "bg-white placeholder:text-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
                "transition-all duration-200",
                hasError && "border-red-300 focus:ring-red-500/20 focus:border-red-500"
              )}
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
          <div key={field.id} className="space-y-2">
            <div className="flex items-center gap-3">
              {getFieldIcon(field.type)}
              <Label htmlFor={field.id} className="text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Input
                id={field.id}
                type="file"
                onChange={(e) => handleFileChange(field.id, e.target.files?.[0] || null)}
                className={cn(
                  inputClasses,
                  "file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 file:text-xs file:font-medium"
                )}
              />
              {fileUploads[field.id] && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleFileChange(field.id, null)}
                  className="h-10 px-3 border-gray-200 hover:bg-gray-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            {fileUploads[field.id] && (
              <div className="flex items-center gap-2 text-xs text-gray-600 bg-blue-50 p-3 rounded-lg">
                <Upload className="w-4 h-4 text-blue-600" />
                <span className="font-medium">{fileUploads[field.id].name}</span>
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
          <div key={field.id} className="space-y-2">
            <div className="flex items-center gap-3">
              {getFieldIcon(field.type)}
              <Label htmlFor={field.id} className="text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
                {field.currency || '$'}
              </span>
              <Input
                id={field.id}
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className={cn(inputClasses, "pl-8")}
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
          <div key={field.id} className="space-y-2">
            <div className="flex items-center gap-3">
              {getFieldIcon(field.type)}
              <Label htmlFor={field.id} className="text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
            <Input
              id={field.id}
              type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : field.type === 'phone' ? 'tel' : field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={inputClasses}
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
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <h3 className="font-medium text-gray-900">Information Submitted</h3>
        </div>
        <div className="space-y-0">
          {fields.map(field => renderField(field))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
          {fields.map(field => renderField(field))}
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Submitting...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              <span>Submit Information</span>
            </div>
          )}
        </Button>
      </form>
    </div>
  );
};

export default DataCollectionMessage;
