
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, Upload, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FieldIcon } from './FieldIcon';

export interface FormField {
  id: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multi_select' | 'rich_text' | 'file_attachment' | 'currency' | 'url' | 'email' | 'phone' | 'textarea';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  currency?: string;
}

interface FormFieldProps {
  field: FormField;
  value: string;
  error?: string;
  isSubmitted?: boolean;
  fileUploads?: Record<string, File>;
  onInputChange: (fieldId: string, value: string) => void;
  onFileChange: (fieldId: string, file: File | null) => void;
  onMultiSelectChange: (fieldId: string, value: string) => void;
}

export const FormFieldComponent: React.FC<FormFieldProps> = ({
  field,
  value,
  error,
  isSubmitted = false,
  fileUploads = {},
  onInputChange,
  onFileChange,
  onMultiSelectChange
}) => {
  if (isSubmitted) {
    return (
      <div className="flex items-center justify-between py-2 px-3 bg-gradient-to-r from-emerald-50/80 to-green-50/80 border border-emerald-200/60 rounded-xl backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 shadow-sm">
            <CheckCircle2 className="w-3 h-3 text-white" />
          </div>
          <span className="text-2xs font-medium text-gray-800">{field.label}</span>
        </div>
        <span className="text-2xs text-emerald-700 font-medium bg-white/50 px-2 py-1 rounded-lg">
          {field.type === 'boolean' ? (value === 'true' ? 'Yes' : 'No') : (value || 'Not provided')}
        </span>
      </div>
    );
  }

  const fieldClasses = cn(
    "group relative overflow-hidden rounded-xl border transition-all duration-300",
    "bg-gradient-to-br from-white/90 to-gray-50/50 backdrop-blur-sm shadow-sm",
    "hover:shadow-md hover:border-blue-300/60 focus-within:border-blue-400/70 focus-within:shadow-md",
    "hover:bg-gradient-to-br hover:from-white hover:to-blue-50/30",
    error ? "border-red-300/70 bg-gradient-to-br from-red-50/50 to-pink-50/30 shadow-red-100/50" : "border-gray-200/60"
  );

  const renderErrorMessage = () => {
    if (!error) return null;
    return (
      <div className="flex items-center gap-1.5 text-2xs text-red-600 px-3 py-1 bg-red-50/50 rounded-lg mt-1">
        <AlertCircle className="w-3 h-3" />
        {error}
      </div>
    );
  };

  switch (field.type) {
    case 'select':
      return (
        <div className="space-y-1">
          <div className={fieldClasses}>
            <div className="flex items-center gap-2.5 p-3">
              <div className="p-1 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100">
                <FieldIcon type={field.type} />
              </div>
              <Label htmlFor={field.id} className="text-2xs font-semibold text-gray-700 flex-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </Label>
              <div className="flex-1 max-w-[140px]">
                <Select value={value} onValueChange={(val) => onInputChange(field.id, val)}>
                  <SelectTrigger className="h-6 border-0 bg-transparent focus:ring-0 text-2xs shadow-none">
                    <SelectValue placeholder={field.placeholder || "Select..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option, index) => (
                      <SelectItem key={index} value={option} className="text-2xs">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          {renderErrorMessage()}
        </div>
      );

    case 'multi_select':
      const selectedValues = value ? value.split(',') : [];
      return (
        <div className="space-y-2">
          <div className={cn(fieldClasses, "p-3")}>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100">
                <FieldIcon type={field.type} />
              </div>
              <Label className="text-2xs font-semibold text-gray-700">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </Label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 rounded-lg bg-white/60 hover:bg-white/80 transition-colors">
                  <Checkbox
                    id={`${field.id}-${index}`}
                    checked={selectedValues.includes(option)}
                    onCheckedChange={() => onMultiSelectChange(field.id, option)}
                    className="w-3.5 h-3.5"
                  />
                  <Label htmlFor={`${field.id}-${index}`} className="text-2xs text-gray-700 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          {renderErrorMessage()}
        </div>
      );

    case 'boolean':
      return (
        <div className="space-y-1">
          <div className={cn(fieldClasses, "p-3")}>
            <div className="flex items-center gap-3">
              <Checkbox
                id={field.id}
                checked={value === 'true'}
                onCheckedChange={(checked) => onInputChange(field.id, checked ? 'true' : 'false')}
                className="w-4 h-4"
              />
              <Label htmlFor={field.id} className="text-2xs font-semibold cursor-pointer text-gray-700 flex-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </Label>
            </div>
          </div>
          {renderErrorMessage()}
        </div>
      );

    case 'rich_text':
    case 'textarea':
      return (
        <div className="space-y-2">
          <div className={cn(fieldClasses, "p-3")}>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 rounded-lg bg-gradient-to-br from-amber-100 to-yellow-100">
                <FieldIcon type={field.type} />
              </div>
              <Label htmlFor={field.id} className="text-2xs font-semibold text-gray-700">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </Label>
            </div>
            <Textarea
              id={field.id}
              value={value}
              onChange={(e) => onInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={cn(
                "min-h-[60px] resize-none text-2xs border-0 bg-white/60 focus:bg-white/80 transition-colors shadow-none focus:ring-0",
                error && "border-red-300 focus:border-red-400"
              )}
            />
          </div>
          {renderErrorMessage()}
        </div>
      );

    case 'file_attachment':
      return (
        <div className="space-y-2">
          <div className={fieldClasses}>
            <div className="flex items-center gap-2.5 p-3">
              <div className="p-1 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100">
                <FieldIcon type={field.type} />
              </div>
              <Label htmlFor={field.id} className="text-2xs font-semibold text-gray-700 flex-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id={field.id}
                  type="file"
                  onChange={(e) => onFileChange(field.id, e.target.files?.[0] || null)}
                  className="w-20 h-6 text-3xs file:mr-1 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 file:text-3xs"
                />
                {fileUploads[field.id] && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onFileChange(field.id, null)}
                    className="h-6 w-6 p-0 bg-white/80 hover:bg-white"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          {fileUploads[field.id] && (
            <div className="flex items-center gap-2 text-2xs text-blue-700 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 p-2 rounded-lg mx-1 backdrop-blur-sm">
              <Upload className="w-3 h-3" />
              <span>{fileUploads[field.id].name}</span>
            </div>
          )}
          {renderErrorMessage()}
        </div>
      );

    case 'currency':
      return (
        <div className="space-y-1">
          <div className={fieldClasses}>
            <div className="flex items-center gap-2.5 p-3">
              <div className="p-1 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100">
                <FieldIcon type={field.type} />
              </div>
              <Label htmlFor={field.id} className="text-2xs font-semibold text-gray-700 flex-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </Label>
              <div className="flex items-center gap-1 flex-1 max-w-[100px]">
                <span className="text-2xs text-gray-500 font-medium">{field.currency || '$'}</span>
                <Input
                  id={field.id}
                  type="number"
                  step="0.01"
                  value={value}
                  onChange={(e) => onInputChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  className="h-6 border-0 bg-transparent focus:ring-0 text-2xs p-0 shadow-none"
                />
              </div>
            </div>
          </div>
          {renderErrorMessage()}
        </div>
      );

    default:
      return (
        <div className="space-y-1">
          <div className={fieldClasses}>
            <div className="flex items-center gap-2.5 p-3">
              <div className="p-1 rounded-lg bg-gradient-to-br from-gray-100 to-slate-100">
                <FieldIcon type={field.type} />
              </div>
              <Label htmlFor={field.id} className="text-2xs font-semibold text-gray-700 flex-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </Label>
              <div className="flex-1 max-w-[140px]">
                <Input
                  id={field.id}
                  type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : field.type === 'phone' ? 'tel' : field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                  value={value}
                  onChange={(e) => onInputChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  className="h-6 border-0 bg-transparent focus:ring-0 text-2xs p-0 shadow-none"
                  step={field.type === 'number' ? '0.01' : undefined}
                />
              </div>
            </div>
          </div>
          {renderErrorMessage()}
        </div>
      );
  }
};
