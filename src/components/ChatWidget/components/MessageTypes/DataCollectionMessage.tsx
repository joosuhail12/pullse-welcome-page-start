
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { FormFieldComponent, FormField } from './FormField';
import { validateFormField } from './formValidation';

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
      const error = validateFormField(field, value);
      if (error) {
        newErrors[field.id] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 max-w-md">
        <div className="space-y-2">
          {fields.map(field => (
            <FormFieldComponent
              key={field.id}
              field={field}
              value={submittedData[field.id] || ''}
              isSubmitted={true}
              onInputChange={handleInputChange}
              onFileChange={handleFileChange}
              onMultiSelectChange={handleMultiSelectChange}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 max-w-md">
      {title && (
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">{title}</h3>
          {description && <p className="text-xs text-gray-600">{description}</p>}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-3">
          {fields.map(field => (
            <FormFieldComponent
              key={field.id}
              field={field}
              value={formData[field.id] || ''}
              error={errors[field.id]}
              fileUploads={fileUploads}
              onInputChange={handleInputChange}
              onFileChange={handleFileChange}
              onMultiSelectChange={handleMultiSelectChange}
            />
          ))}
        </div>

        <div className="pt-2 border-t border-gray-100">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full h-9 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Submitting...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="w-3.5 h-3.5" />
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
