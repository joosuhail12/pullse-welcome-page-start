
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
      <div className="flex items-center justify-between py-2.5 px-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded bg-green-100">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
          </div>
          <span className="text-sm font-medium text-gray-800">{field.label}</span>
        </div>
        <span className="text-sm text-green-700 font-medium">
          {field.type === 'boolean' ? (value === 'true' ? 'Yes' : 'No') : (value || 'Not provided')}
        </span>
      </div>
    );
  }

  const fieldClasses = cn(
    "group flex items-center gap-3 py-2.5 px-3 rounded-lg border transition-colors",
    "hover:border-gray-300 focus-within:border-blue-400 focus-within:bg-blue-50/30",
    error ? "border-red-300 bg-red-50/30" : "border-gray-200 bg-white"
  );

  const renderErrorMessage = () => {
    if (!error) return null;
    return (
      <div className="flex items-center gap-1.5 text-xs text-red-600 px-3">
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
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <FieldIcon type={field.type} />
              <Label htmlFor={field.id} className="text-sm font-medium text-gray-700 truncate">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </Label>
            </div>
            <div className="flex-1 max-w-[180px]">
              <Select value={value} onValueChange={(val) => onInputChange(field.id, val)}>
                <SelectTrigger className="h-7 border-0 bg-transparent focus:ring-0 text-sm">
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
          {renderErrorMessage()}
        </div>
      );

    case 'multi_select':
      const selectedValues = value ? value.split(',') : [];
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 px-3">
            <FieldIcon type={field.type} />
            <Label className="text-sm font-medium text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
          </div>
          <div className="grid grid-cols-2 gap-2 px-3">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 py-1">
                <Checkbox
                  id={`${field.id}-${index}`}
                  checked={selectedValues.includes(option)}
                  onCheckedChange={() => onMultiSelectChange(field.id, option)}
                  className="w-4 h-4"
                />
                <Label htmlFor={`${field.id}-${index}`} className="text-sm text-gray-700 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
          {renderErrorMessage()}
        </div>
      );

    case 'boolean':
      return (
        <div className="space-y-1">
          <div className={cn("flex items-center gap-3 py-2.5 px-3 rounded-lg border", error ? "border-red-300 bg-red-50/30" : "border-gray-200 bg-white")}>
            <Checkbox
              id={field.id}
              checked={value === 'true'}
              onCheckedChange={(checked) => onInputChange(field.id, checked ? 'true' : 'false')}
              className="w-4 h-4"
            />
            <Label htmlFor={field.id} className="text-sm font-medium cursor-pointer text-gray-700 flex-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
          </div>
          {renderErrorMessage()}
        </div>
      );

    case 'rich_text':
    case 'textarea':
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 px-3">
            <FieldIcon type={field.type} />
            <Label htmlFor={field.id} className="text-sm font-medium text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
          </div>
          <div className="px-3">
            <Textarea
              id={field.id}
              value={value}
              onChange={(e) => onInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={cn(
                "min-h-[70px] resize-none text-sm border-gray-200 focus:border-blue-400",
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
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <FieldIcon type={field.type} />
              <Label htmlFor={field.id} className="text-sm font-medium text-gray-700 truncate">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Input
                id={field.id}
                type="file"
                onChange={(e) => onFileChange(field.id, e.target.files?.[0] || null)}
                className="w-24 h-7 text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 file:text-xs"
              />
              {fileUploads[field.id] && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onFileChange(field.id, null)}
                  className="h-7 w-7 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
          {fileUploads[field.id] && (
            <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 p-2 rounded mx-3">
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
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <FieldIcon type={field.type} />
              <Label htmlFor={field.id} className="text-sm font-medium text-gray-700 truncate">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </Label>
            </div>
            <div className="flex items-center gap-1 flex-1 max-w-[120px]">
              <span className="text-sm text-gray-500">{field.currency || '$'}</span>
              <Input
                id={field.id}
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => onInputChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className="h-7 border-0 bg-transparent focus:ring-0 text-sm p-0"
              />
            </div>
          </div>
          {renderErrorMessage()}
        </div>
      );

    default:
      return (
        <div className="space-y-1">
          <div className={fieldClasses}>
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <FieldIcon type={field.type} />
              <Label htmlFor={field.id} className="text-sm font-medium text-gray-700 truncate">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </Label>
            </div>
            <div className="flex-1 max-w-[180px]">
              <Input
                id={field.id}
                type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : field.type === 'phone' ? 'tel' : field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                value={value}
                onChange={(e) => onInputChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className="h-7 border-0 bg-transparent focus:ring-0 text-sm p-0"
                step={field.type === 'number' ? '0.01' : undefined}
              />
            </div>
          </div>
          {renderErrorMessage()}
        </div>
      );
  }
};
