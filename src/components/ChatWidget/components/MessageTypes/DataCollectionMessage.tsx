import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Sparkles } from 'lucide-react';
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
      const {
        [fieldId]: removed,
        ...rest
      } = fileUploads;
      setFileUploads(rest);
      setFormData(prev => ({
        ...prev,
        [fieldId]: ''
      }));
    }
  };
  const handleMultiSelectChange = (fieldId: string, value: string) => {
    const currentValues = formData[fieldId] ? formData[fieldId].split(',') : [];
    const newValues = currentValues.includes(value) ? currentValues.filter(v => v !== value) : [...currentValues, value];
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
    return <div className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/60 shadow-lg p-4 max-w-sm backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-200/20 to-emerald-300/20 rounded-full -translate-y-8 translate-x-8"></div>
        
        <div className="relative z-10 text-center mb-3">
          <div className="flex items-center justify-center mb-2">
            <div className="p-1.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-md">
              <Sparkles size={14} className="text-white" />
            </div>
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">Information Submitted!</h3>
          <p className="text-2xs text-gray-600">Thank you for providing the details</p>
        </div>

        <div className="relative z-10 space-y-2">
          {fields.map(field => <FormFieldComponent key={field.id} field={field} value={submittedData[field.id] || ''} isSubmitted={true} onInputChange={handleInputChange} onFileChange={handleFileChange} onMultiSelectChange={handleMultiSelectChange} />)}
        </div>
      </div>;
  }
  return <div className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/60 shadow-lg p-4 max-w-sm backdrop-blur-sm">
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-200/20 to-indigo-300/20 rounded-full -translate-y-8 translate-x-8"></div>
      
      {title && <div className="relative z-10 text-center mb-3">
          
          {description}
        </div>}
      
      <form onSubmit={handleSubmit} className="relative z-10 space-y-3">
        <div className="space-y-2">
          {fields.map(field => <FormFieldComponent key={field.id} field={field} value={formData[field.id] || ''} error={errors[field.id]} fileUploads={fileUploads} onInputChange={handleInputChange} onFileChange={handleFileChange} onMultiSelectChange={handleMultiSelectChange} />)}
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={isSubmitting} className="w-full h-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-2xs">
            {isSubmitting ? <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Submitting...</span>
              </div> : <div className="flex items-center gap-1.5">
                <Send className="w-3 h-3" />
                <span>Submit</span>
              </div>}
          </Button>
        </div>
      </form>
    </div>;
};
export default DataCollectionMessage;