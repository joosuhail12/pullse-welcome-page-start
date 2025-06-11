
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate submission delay
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
        <div key={field.id} className="group">
          <div className="flex items-center gap-3 mb-2">
            {getFieldIcon(field.type)}
            <Label className="text-sm font-medium text-foreground/90">{field.label}</Label>
          </div>
          <div className="flex items-center gap-3 p-4 bg-green-50/50 border border-green-200/50 rounded-xl text-sm text-foreground/80 transition-all duration-200">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="font-medium">
              {field.type === 'boolean' ? (value === 'true' ? 'Yes' : 'No') : (value || 'Not provided')}
            </span>
          </div>
        </div>
      );
    }

    const baseInputClasses = cn(
      "h-12 text-sm transition-all duration-200",
      "border-2 border-border/50 focus:border-primary/60 focus:ring-4 focus:ring-primary/10",
      "bg-background/50 backdrop-blur-sm hover:bg-background/80",
      "rounded-xl shadow-sm hover:shadow-md",
      hasError && "border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50"
    );

    switch (field.type) {
      case 'select':
        return (
          <div key={field.id} className="group space-y-3">
            <div className="flex items-center gap-3">
              {getFieldIcon(field.type)}
              <Label htmlFor={field.id} className="text-sm font-semibold text-foreground/90">
                {field.label} {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
            <Select value={value} onValueChange={(val) => handleInputChange(field.id, val)}>
              <SelectTrigger className={cn(baseInputClasses, "justify-between")}>
                <SelectValue placeholder={field.placeholder || `Choose ${field.label.toLowerCase()}...`} />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-2 shadow-lg">
                {field.options?.map((option, index) => (
                  <SelectItem 
                    key={index} 
                    value={option}
                    className="rounded-lg my-1 focus:bg-primary/10 cursor-pointer"
                  >
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50/50 p-2 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{hasError}</span>
              </div>
            )}
          </div>
        );

      case 'multi_select':
        const selectedValues = value ? value.split(',') : [];
        return (
          <div key={field.id} className="group space-y-3">
            <div className="flex items-center gap-3">
              {getFieldIcon(field.type)}
              <Label className="text-sm font-semibold text-foreground/90">
                {field.label} {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
            <div className="space-y-3 p-5 border-2 border-border/50 rounded-xl bg-background/30 backdrop-blur-sm">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-4 group/item">
                  <Checkbox
                    id={`${field.id}-${index}`}
                    checked={selectedValues.includes(option)}
                    onCheckedChange={() => handleMultiSelectChange(field.id, option)}
                    className="w-5 h-5 rounded-md border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all duration-200"
                  />
                  <Label 
                    htmlFor={`${field.id}-${index}`} 
                    className="text-sm font-medium cursor-pointer text-foreground/80 group-hover/item:text-foreground transition-colors"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            {hasError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50/50 p-2 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{hasError}</span>
              </div>
            )}
          </div>
        );

      case 'boolean':
        return (
          <div key={field.id} className="group space-y-3">
            <div className="flex items-center space-x-4 p-5 border-2 border-border/50 rounded-xl bg-background/30 backdrop-blur-sm hover:bg-background/50 transition-all duration-200 group/item">
              <Checkbox
                id={field.id}
                checked={value === 'true'}
                onCheckedChange={(checked) => handleInputChange(field.id, checked ? 'true' : 'false')}
                className="w-5 h-5 rounded-md border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all duration-200"
              />
              <Label htmlFor={field.id} className="text-sm font-semibold cursor-pointer text-foreground/90 group-hover/item:text-foreground transition-colors">
                {field.label} {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
            {hasError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50/50 p-2 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{hasError}</span>
              </div>
            )}
          </div>
        );

      case 'rich_text':
      case 'textarea':
        return (
          <div key={field.id} className="group space-y-3">
            <div className="flex items-center gap-3">
              {getFieldIcon(field.type)}
              <Label htmlFor={field.id} className="text-sm font-semibold text-foreground/90">
                {field.label} {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
            <Textarea
              id={field.id}
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={cn(
                baseInputClasses,
                "min-h-[120px] resize-none leading-relaxed p-4"
              )}
            />
            {hasError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50/50 p-2 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{hasError}</span>
              </div>
            )}
          </div>
        );

      case 'file_attachment':
        return (
          <div key={field.id} className="group space-y-3">
            <div className="flex items-center gap-3">
              {getFieldIcon(field.type)}
              <Label htmlFor={field.id} className="text-sm font-semibold text-foreground/90">
                {field.label} {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Input
                    id={field.id}
                    type="file"
                    onChange={(e) => handleFileChange(field.id, e.target.files?.[0] || null)}
                    className={cn(
                      baseInputClasses,
                      "file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0",
                      "file:bg-primary/10 file:text-primary file:font-medium",
                      "hover:file:bg-primary/20 file:transition-colors"
                    )}
                  />
                </div>
                {fileUploads[field.id] && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleFileChange(field.id, null)}
                    className="h-12 px-4 border-2 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {fileUploads[field.id] && (
                <div className="flex items-center gap-3 text-sm text-foreground/70 bg-primary/5 p-3 rounded-xl border border-primary/20">
                  <Upload className="w-4 h-4 text-primary" />
                  <span className="font-medium">{fileUploads[field.id].name}</span>
                </div>
              )}
            </div>
            {hasError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50/50 p-2 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{hasError}</span>
              </div>
            )}
          </div>
        );

      case 'currency':
        return (
          <div key={field.id} className="group space-y-3">
            <div className="flex items-center gap-3">
              {getFieldIcon(field.type)}
              <Label htmlFor={field.id} className="text-sm font-semibold text-foreground/90">
                {field.label} {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-foreground/60 font-bold text-lg z-10">
                {field.currency || '$'}
              </span>
              <Input
                id={field.id}
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className={cn(baseInputClasses, "pl-12 font-mono text-right")}
              />
            </div>
            {hasError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50/50 p-2 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{hasError}</span>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div key={field.id} className="group space-y-3">
            <div className="flex items-center gap-3">
              {getFieldIcon(field.type)}
              <Label htmlFor={field.id} className="text-sm font-semibold text-foreground/90">
                {field.label} {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
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
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50/50 p-2 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{hasError}</span>
              </div>
            )}
          </div>
        );
    }
  };

  if (isSubmitted) {
    return (
      <div className="p-8 bg-gradient-to-br from-green-50/50 via-emerald-50/30 to-green-50/50 border-2 border-green-200/50 rounded-2xl shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-2xl shadow-sm">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-green-800">Information Submitted Successfully</h3>
            <p className="text-sm text-green-600/80">Thank you for providing the requested information.</p>
          </div>
        </div>
        
        <div className="space-y-6">
          {fields.map(field => renderField(field))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-background via-background/95 to-background/90 border-2 border-border/50 rounded-2xl shadow-lg backdrop-blur-sm">
      <div className="mb-8">
        <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
        {description && (
          <p className="text-sm text-foreground/70 leading-relaxed bg-muted/30 p-4 rounded-xl border border-border/30">
            {description}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map(field => renderField(field))}

        <div className="pt-6 border-t border-border/30">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className={cn(
              "w-full h-14 text-sm font-semibold rounded-2xl transition-all duration-300",
              "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary",
              "shadow-lg hover:shadow-xl hover:shadow-primary/25",
              "focus:ring-4 focus:ring-primary/20 focus:scale-[0.98]",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            )}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Submitting Information...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Send className="w-5 h-5" />
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
