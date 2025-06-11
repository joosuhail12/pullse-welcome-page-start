import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, Send, Upload, X, AlertCircle, Calendar, DollarSign, Mail, Phone, Link2, Hash, FileText, Plus } from 'lucide-react';
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
    const iconProps = "w-4 h-4 text-gray-400";
    switch (type) {
      case 'email': return <Mail className={iconProps} />;
      case 'phone': return <Phone className={iconProps} />;
      case 'url': return <Link2 className={iconProps} />;
      case 'number': return <Hash className={iconProps} />;
      case 'currency': return <DollarSign className={iconProps} />;
      case 'date': return <Calendar className={iconProps} />;
      case 'textarea':
      case 'rich_text': return <FileText className={iconProps} />;
      case 'file_attachment': return <Upload className={iconProps} />;
      case 'select':
      case 'multi_select': return <Plus className={iconProps} />;
      default: return <FileText className={iconProps} />;
    }
  };

  const getFieldTypeLabel = (type: string) => {
    switch (type) {
      case 'email': return 'Email';
      case 'phone': return 'Phone';
      case 'url': return 'URL';
      case 'number': return 'Number';
      case 'currency': return 'Currency';
      case 'date': return 'Date';
      case 'textarea':
      case 'rich_text': return 'Text';
      case 'file_attachment': return 'File';
      case 'select': return 'Select';
      case 'multi_select': return 'Multi-select';
      case 'boolean': return 'Checkbox';
      default: return 'Text';
    }
  };

  const renderField = (field: FormField) => {
    const value = isSubmitted ? submittedData[field.id] || '' : formData[field.id] || '';
    const hasError = errors[field.id];

    if (isSubmitted) {
      return (
        <div key={field.id} className="flex items-center justify-between py-3 px-4 rounded-lg bg-green-50/50 border border-green-200/50">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-md bg-green-100">
              {getFieldIcon(field.type)}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">{field.label}</div>
              <div className="text-xs text-gray-500">{getFieldTypeLabel(field.type)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              {field.type === 'boolean' ? (value === 'true' ? 'Yes' : 'No') : (value || 'Not provided')}
            </span>
          </div>
        </div>
      );
    }

    const fieldContainer = "group relative rounded-lg border border-gray-200 hover:border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all duration-200 bg-white";
    const fieldHeader = "flex items-center gap-3 px-4 py-3 border-b border-gray-100";
    const fieldContent = "px-4 py-3";

    switch (field.type) {
      case 'select':
        return (
          <div key={field.id} className={cn(fieldContainer, hasError && "border-red-300 focus-within:border-red-500 focus-within:ring-red-500/20")}>
            <div className={fieldHeader}>
              <div className="p-1.5 rounded-md bg-gray-100 group-focus-within:bg-blue-100">
                {getFieldIcon(field.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium text-gray-900">{field.label}</Label>
                  {field.required && <span className="text-red-500 text-sm">*</span>}
                </div>
                <div className="text-xs text-gray-500">{getFieldTypeLabel(field.type)}</div>
              </div>
            </div>
            <div className={fieldContent}>
              <Select value={value} onValueChange={(val) => handleInputChange(field.id, val)}>
                <SelectTrigger className="border-0 bg-transparent focus:ring-0 p-0 h-auto">
                  <SelectValue placeholder={field.placeholder || "Choose an option"} />
                </SelectTrigger>
                <SelectContent className="z-50">
                  {field.options?.map((option, index) => (
                    <SelectItem key={index} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasError && (
                <div className="flex items-center gap-2 text-xs text-red-600 mt-2">
                  <AlertCircle className="w-3 h-3" />
                  {hasError}
                </div>
              )}
            </div>
          </div>
        );

      case 'multi_select':
        const selectedValues = value ? value.split(',') : [];
        return (
          <div key={field.id} className={cn(fieldContainer, hasError && "border-red-300")}>
            <div className={fieldHeader}>
              <div className="p-1.5 rounded-md bg-gray-100">
                {getFieldIcon(field.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium text-gray-900">{field.label}</Label>
                  {field.required && <span className="text-red-500 text-sm">*</span>}
                </div>
                <div className="text-xs text-gray-500">{getFieldTypeLabel(field.type)}</div>
              </div>
            </div>
            <div className={fieldContent}>
              <div className="space-y-2">
                {field.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3">
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
                <div className="flex items-center gap-2 text-xs text-red-600 mt-2">
                  <AlertCircle className="w-3 h-3" />
                  {hasError}
                </div>
              )}
            </div>
          </div>
        );

      case 'boolean':
        return (
          <div key={field.id} className={cn(fieldContainer, hasError && "border-red-300")}>
            <div className="px-4 py-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id={field.id}
                  checked={value === 'true'}
                  onCheckedChange={(checked) => handleInputChange(field.id, checked ? 'true' : 'false')}
                  className="w-5 h-5"
                />
                <div className="flex-1">
                  <Label htmlFor={field.id} className="text-sm font-medium cursor-pointer text-gray-900">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  <div className="text-xs text-gray-500">{getFieldTypeLabel(field.type)}</div>
                </div>
              </div>
              {hasError && (
                <div className="flex items-center gap-2 text-xs text-red-600 mt-2">
                  <AlertCircle className="w-3 h-3" />
                  {hasError}
                </div>
              )}
            </div>
          </div>
        );

      case 'rich_text':
      case 'textarea':
        return (
          <div key={field.id} className={cn(fieldContainer, hasError && "border-red-300 focus-within:border-red-500 focus-within:ring-red-500/20")}>
            <div className={fieldHeader}>
              <div className="p-1.5 rounded-md bg-gray-100 group-focus-within:bg-blue-100">
                {getFieldIcon(field.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor={field.id} className="text-sm font-medium text-gray-900">{field.label}</Label>
                  {field.required && <span className="text-red-500 text-sm">*</span>}
                </div>
                <div className="text-xs text-gray-500">{getFieldTypeLabel(field.type)}</div>
              </div>
            </div>
            <div className={fieldContent}>
              <Textarea
                id={field.id}
                value={value}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                placeholder={field.placeholder || "Type your response..."}
                className="min-h-[80px] resize-none border-0 bg-transparent focus:ring-0 p-0"
              />
              {hasError && (
                <div className="flex items-center gap-2 text-xs text-red-600 mt-2">
                  <AlertCircle className="w-3 h-3" />
                  {hasError}
                </div>
              )}
            </div>
          </div>
        );

      case 'file_attachment':
        return (
          <div key={field.id} className={cn(fieldContainer, hasError && "border-red-300")}>
            <div className={fieldHeader}>
              <div className="p-1.5 rounded-md bg-gray-100">
                {getFieldIcon(field.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor={field.id} className="text-sm font-medium text-gray-900">{field.label}</Label>
                  {field.required && <span className="text-red-500 text-sm">*</span>}
                </div>
                <div className="text-xs text-gray-500">{getFieldTypeLabel(field.type)}</div>
              </div>
            </div>
            <div className={fieldContent}>
              <div className="flex items-center gap-3">
                <Input
                  id={field.id}
                  type="file"
                  onChange={(e) => handleFileChange(field.id, e.target.files?.[0] || null)}
                  className="flex-1 border-0 bg-transparent focus:ring-0 p-0 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 file:text-sm file:font-medium"
                />
                {fileUploads[field.id] && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleFileChange(field.id, null)}
                    className="h-8 px-2"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
              {fileUploads[field.id] && (
                <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 p-3 rounded-md mt-3">
                  <Upload className="w-4 h-4" />
                  <span>{fileUploads[field.id].name}</span>
                </div>
              )}
              {hasError && (
                <div className="flex items-center gap-2 text-xs text-red-600 mt-2">
                  <AlertCircle className="w-3 h-3" />
                  {hasError}
                </div>
              )}
            </div>
          </div>
        );

      case 'currency':
        return (
          <div key={field.id} className={cn(fieldContainer, hasError && "border-red-300 focus-within:border-red-500 focus-within:ring-red-500/20")}>
            <div className={fieldHeader}>
              <div className="p-1.5 rounded-md bg-gray-100 group-focus-within:bg-blue-100">
                {getFieldIcon(field.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor={field.id} className="text-sm font-medium text-gray-900">{field.label}</Label>
                  {field.required && <span className="text-red-500 text-sm">*</span>}
                </div>
                <div className="text-xs text-gray-500">{getFieldTypeLabel(field.type)}</div>
              </div>
            </div>
            <div className={fieldContent}>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-medium">{field.currency || '$'}</span>
                <Input
                  id={field.id}
                  type="number"
                  step="0.01"
                  value={value}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  placeholder={field.placeholder || "0.00"}
                  className="flex-1 border-0 bg-transparent focus:ring-0 p-0"
                />
              </div>
              {hasError && (
                <div className="flex items-center gap-2 text-xs text-red-600 mt-2">
                  <AlertCircle className="w-3 h-3" />
                  {hasError}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div key={field.id} className={cn(fieldContainer, hasError && "border-red-300 focus-within:border-red-500 focus-within:ring-red-500/20")}>
            <div className={fieldHeader}>
              <div className="p-1.5 rounded-md bg-gray-100 group-focus-within:bg-blue-100">
                {getFieldIcon(field.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor={field.id} className="text-sm font-medium text-gray-900">{field.label}</Label>
                  {field.required && <span className="text-red-500 text-sm">*</span>}
                </div>
                <div className="text-xs text-gray-500">{getFieldTypeLabel(field.type)}</div>
              </div>
            </div>
            <div className={fieldContent}>
              <Input
                id={field.id}
                type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : field.type === 'phone' ? 'tel' : field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                value={value}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                className="border-0 bg-transparent focus:ring-0 p-0"
                step={field.type === 'number' ? '0.01' : undefined}
              />
              {hasError && (
                <div className="flex items-center gap-2 text-xs text-red-600 mt-2">
                  <AlertCircle className="w-3 h-3" />
                  {hasError}
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="space-y-3">
          {fields.map(field => renderField(field))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          {fields.map(field => renderField(field))}
        </div>

        <div className="pt-4 border-t border-gray-100">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full h-11 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
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
        </div>
      </form>
    </div>
  );
};

export default DataCollectionMessage;

</edits_to_apply>
