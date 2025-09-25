import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { FormFieldComponent, DataCollectionFormField } from './FormField';
import { UserActionData } from '../../types';
import { toast } from 'sonner';

interface DataCollectionMessageProps {
  fields: DataCollectionFormField[];
  onSubmit: (action: "csat" | "action_button" | "data_collection", data: Partial<UserActionData>, conversationId: string) => void;
  isRequired?: boolean;
  allowUserAction?: boolean;
  messageId: string;
}
const DataCollectionMessage: React.FC<DataCollectionMessageProps> = ({
  fields,
  onSubmit,
  isRequired = false,
  allowUserAction = true,
  messageId
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileUploads, setFileUploads] = useState<Record<string, File>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  // Create a mapping from field.id to field.field
  const fieldIdToFieldMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    fields.forEach(field => {
      map[field.id] = field.field;
    });
    return map;
  }, [fields]);

  const handleInputChange = (fieldId: string, value: string) => {
    // Convert fieldId to field.field for storage
    const fieldKey = fieldIdToFieldMap[fieldId] || fieldId;
    setFormData(prev => ({
      ...prev,
      [fieldKey]: value
    }));
    if (errors[fieldKey]) {
      setErrors(prev => ({
        ...prev,
        [fieldKey]: ''
      }));
    }
  };

  const handleFileChange = (fieldId: string, file: File | null) => {
    const fieldKey = fieldIdToFieldMap[fieldId] || fieldId;
    if (file) {
      setFileUploads(prev => ({
        ...prev,
        [fieldKey]: file
      }));
      setFormData(prev => ({
        ...prev,
        [fieldKey]: file.name
      }));
    } else {
      const {
        [fieldKey]: removed,
        ...rest
      } = fileUploads;
      setFileUploads(rest);
      setFormData(prev => ({
        ...prev,
        [fieldKey]: ''
      }));
    }
  };

  const handleMultiSelectChange = (fieldId: string, value: string) => {
    const fieldKey = fieldIdToFieldMap[fieldId] || fieldId;
    const currentValues = formData[fieldKey] ? formData[fieldKey].split(',') : [];
    const newValues = currentValues.includes(value) ? currentValues.filter(v => v !== value) : [...currentValues, value];
    handleInputChange(fieldId, newValues.join(','));
  };

  const validateForm = () => {
    // Check if the whole form is required to be filled
    if (isFormSubmitted) {
      toast.error('You have already submitted the form');
      return false;
    }
    if (isRequired) {
      const requiredFields = fields.filter(field => field.required);
      const missingFields = requiredFields.filter(field => !formData[field.field]);
      if (missingFields.length > 0) {
        setErrors(prev => ({
          ...prev,
          [missingFields[0].field]: 'This field is required'
        }));
        return false;
      }
    } else {
      // Check if any of the fields are required to be filled
      const requiredFields = fields.filter(field => field.required);
      const missingFields = requiredFields.filter(field => !formData[field.field]);
      if (missingFields.length > 0) {
        setErrors(prev => ({
          ...prev,
          [missingFields[0].field]: 'This field is required'
        }));
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        setIsFormSubmitted(true);
        // Convert the formdata as per userActionData fields key
        const userActionData: Partial<UserActionData> = {
          data_collection: {
            fields: fields.map(field => ({
              field: field.field,
              label: field.label,
              table: field.table,
              required: field.required,
              customFieldId: field.customFieldId,
              customObjectId: field.customObjectId,
              customObjectFieldId: field.customObjectFieldId,
              value: formData[field.field] || ''
            }))
          }
        };
        onSubmit("data_collection", userActionData, messageId);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return <div className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/60 shadow-lg p-4 max-w-sm backdrop-blur-sm">
    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-200/20 to-indigo-300/20 rounded-full -translate-y-8 translate-x-8"></div>

    {isRequired && <div className="text-xs text-gray-500">This form is required</div>}

    <form onSubmit={handleSubmit} className="relative z-10 space-y-3" >
      {
        allowUserAction && (<div className="space-y-2">
          {fields.map(field => <FormFieldComponent key={field.id} field={field} value={formData[field.field] || ''} error={errors[field.field]} fileUploads={fileUploads} onInputChange={handleInputChange} onFileChange={handleFileChange} onMultiSelectChange={handleMultiSelectChange} />)}
        </div>)
      }

      <div className="pt-2">
        <Button disabled={isSubmitting || !allowUserAction || isFormSubmitted} type="submit" className="w-full h-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-2xs">
          {isSubmitting ? <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Submitting...</span>
          </div> : <div className={`flex items-center gap-1.5 ${!isFormSubmitted ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
            <Send className="w-3 h-3 ${isFormSubmitted ? 'text-green-500' : 'text-white'}" />
            <span>{isFormSubmitted ? 'Submitted' : 'Submit'}</span>
          </div>}
        </Button>
      </div>
    </form>
  </div>;
};
export default DataCollectionMessage;