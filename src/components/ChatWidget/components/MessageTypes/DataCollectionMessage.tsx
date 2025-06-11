
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
      case 'email': return <Mail className="w-4 h-4 text-muted-foreground" />;
      case 'phone': return <Phone className="w-4 h-4 text-muted-foreground" />;
      case 'url': return <Link2 className="w-4 h-4 text-muted-foreground" />;
      case 'number': return <Hash className="w-4 h-4 text-muted-foreground" />;
      case 'currency': return <DollarSign className="w-4 h-4 text-muted-foreground" />;
      case 'date': return <Calendar className="w-4 h-4 text-muted-foreground" />;
      case 'textarea':
      case 'rich_text': return <FileText className="w-4 h-4 text-muted-foreground" />;
      case 'file_attachment': return <Upload className="w-4 h-4 text-muted-foreground" />;
      default: return null;
    }
  };

  const renderField = (field: FormField) => {
    const value = isSubmitted ? submittedData[field.id] || '' : formData[field.id] || '';
    const hasError = errors[field.id];

    if (isSubmitted) {
      return (
        <div key={field.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            {getFieldIcon(field.type)}
            <span className="font-medium">{field.label}</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-green-700">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>{field.type === 'boolean' ? (value === 'true' ? 'Yes' : 'No') : (value || 'Not provided')}</span>
          </div>
        </div>
      );
    }

    const baseInputClasses = cn(
      "h-9 text-sm border border-gray-200 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20",
      "rounded-lg transition-all duration-200 placeholder:text-gray-400",
      hasError && "border-red-300 focus:border-red-500 focus:ring-red-500/20"
    );

    switch (field.type) {
      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {getFieldIcon(field.type)}
                <Label htmlFor={field.id} className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </Label>
              </div>
              <div className="flex-1 max-w-48">
                <Select value={value} onValueChange={(val) => handleInputChange(field.id, val)}>
                  <SelectTrigger className={baseInputClasses}>
                    <SelectValue placeholder={field.placeholder || "Select..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option, index) => (
                      <SelectItem key={index} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {hasError && (
              <div className="flex items-center gap-2 text-xs text-red-600 ml-7">
                <AlertCircle className="w-3 h-3" />
                {hasError}
              </div>
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
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </Label>
            </div>
            <div className="grid grid-cols-2 gap-3 ml-7 p-3 bg-gray-50 rounded-lg">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}-${index}`}
                    checked={selectedValues.includes(option)}
                    onCheckedChange={() => handleMultiSelectChange(field.id, option)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor={`${field.id}-${index}`} className="text-sm text-gray-700 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            {hasError && (
              <div className="flex items-center gap-2 text-xs text-red-600 ml-7">
                <AlertCircle className="w-3 h-3" />
                {hasError}
              </div>
            )}
          </div>
        );

      case 'boolean':
        return (
          <div key={field.id} className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id={field.id}
                  checked={value === 'true'}
                  onCheckedChange={(checked) => handleInputChange(field.id, checked ? 'true' : 'false')}
                  className="w-4 h-4"
                />
                <Label htmlFor={field.id} className="text-sm font-medium cursor-pointer text-gray-700">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </Label>
              </div>
            </div>
            {hasError && (
              <div className="flex items-center gap-2 text-xs text-red-600 ml-7">
                <AlertCircle className="w-3 h-3" />
                {hasError}
              </div>
            )}
          </div>
        );

      case 'rich_text':
      case 'textarea':
        return (
          <div key={field.id} className="space-y-3">
            <div className="flex items-center gap-3">
              {getFieldIcon(field.type)}
              <Label htmlFor={field.id} className="text-sm font-medium text-gray-700">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </Label>
            </div>
            <Textarea
              id={field.id}
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={cn(
                "min-h-[80px] resize-none text-sm border border-gray-200 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-lg ml-7",
                hasError && "border-red-300 focus:border-red-500 focus:ring-red-500/20"
              )}
            />
            {hasError && (
              <div className="flex items-center gap-2 text-xs text-red-600 ml-7">
                <AlertCircle className="w-3 h-3" />
                {hasError}
              </div>
            )}
          </div>
        );

      case 'file_attachment':
        return (
          <div key={field.id} className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {getFieldIcon(field.type)}
                <Label htmlFor={field.id} className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </Label>
              </div>
              <div className="flex items-center gap-2 flex-1 max-w-48">
                <Input
                  id={field.id}
                  type="file"
                  onChange={(e) => handleFileChange(field.id, e.target.files?.[0] || null)}
                  className={cn(baseInputClasses, "file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 file:text-xs file:font-medium")}
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
            </div>
            {fileUploads[field.id] && (
              <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 p-2 rounded-lg ml-7">
                <Upload className="w-3 h-3" />
                <span>{fileUploads[field.id].name}</span>
              </div>
            )}
            {hasError && (
              <div className="flex items-center gap-2 text-xs text-red-600 ml-7">
                <AlertCircle className="w-3 h-3" />
                {hasError}
              </div>
            )}
          </div>
        );

      case 'currency':
        return (
          <div key={field.id} className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {getFieldIcon(field.type)}
                <Label htmlFor={field.id} className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </Label>
              </div>
              <div className="relative flex-1 max-w-48">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
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
            </div>
            {hasError && (
              <div className="flex items-center gap-2 text-xs text-red-600 ml-7">
                <AlertCircle className="w-3 h-3" />
                {hasError}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div key={field.id} className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {getFieldIcon(field.type)}
                <Label htmlFor={field.id} className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </Label>
              </div>
              <div className="flex-1 max-w-48">
                <Input
                  id={field.id}
                  type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : field.type === 'phone' ? 'tel' : field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                  value={value}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  className={baseInputClasses}
                  step={field.type === 'number' ? '0.01' : undefined}
                />
              </div>
            </div>
            {hasError && (
              <div className="flex items-center gap-2 text-xs text-red-600 ml-7">
                <AlertCircle className="w-3 h-3" />
                {hasError}
              </div>
            )}
          </div>
        );
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
        <div className="space-y-1">
          {fields.map(field => renderField(field))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          {fields.map(field => renderField(field))}
        </div>

        <div className="pt-2 border-t border-gray-100">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full h-10 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Submitting...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                <span>Submit</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DataCollectionMessage;
