
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { validateField } from '../utils/validation';
import { dispatchChatEvent } from '../utils/events';
import { ChatWidgetConfig, PreChatFormField } from '../config';
import { User, AtSign } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface PreChatFormProps {
  config: ChatWidgetConfig;
  onFormComplete: (formData: FormDataStructure) => void;
}

export interface FormDataStructure {
  contact: FormField[];
  company: FormField[];
  customData: FormField[];
  ticket: FormField[];
  customobjectfield: FormField[];
}

interface FormField {
  entityname: string;
  columnname: string;
  value: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
}

const PreChatForm = ({ config, onFormComplete }: PreChatFormProps) => {
  const [formData, setFormData] = useState<Record<string, Record<string, string>>>({
    contact: {},
    company: {},
    customData: {},
    ticket: {},
    customobjectfield: {}
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formValid, setFormValid] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const isMobile = useIsMobile();

  // Get all fields and sort by position
  const sortedFields = (config.widgetfield || []).sort((a, b) => a.position - b.position);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }, field: PreChatFormField) => {
    const { value } = e.target;
    const { entityname, columnname } = field;

    setTouched(prev => ({
      ...prev,
      [`${entityname}.${columnname}`]: true
    }));

    const error = validateField(`${entityname}.${columnname}`, value, field.required || false);

    setFormErrors(prev => ({
      ...prev,
      [`${entityname}.${columnname}`]: error || ''
    }));

    setFormData(prev => ({
      ...prev,
      [entityname]: {
        ...prev[entityname],
        [columnname]: value
      }
    }));

    validateFormCompletion({
      ...formData,
      [entityname]: {
        ...formData[entityname],
        [columnname]: value
      }
    });
  };

  const validateFormCompletion = (data: Record<string, any>) => {
    const requiredFields = sortedFields.filter(field => field.required);

    const allRequiredFilled = requiredFields.every(field => {
      const { entityname, columnname } = field;
      const fieldValue = data[entityname]?.[columnname];
      return fieldValue &&
        fieldValue.trim() !== '' &&
        !validateField(`${entityname}.${columnname}`, fieldValue, true);
    });

    setFormValid(allRequiredFilled);
  };

  const submitForm = () => {
    if (!formValid) return;

    const structuredData: FormDataStructure = {
      contact: [],
      company: [],
      customData: [],
      ticket: [],
      customobjectfield: []
    };

    Object.entries(formData).forEach(([entityName, columnData]) => {
      Object.entries(columnData).forEach(([columnName, value]) => {
        const fieldConfig = sortedFields.find(
          field => field.entityname === entityName && field.columnname === columnName
        );

        if (fieldConfig) {
          const fieldData: FormField = {
            entityname: fieldConfig.entityname,
            columnname: fieldConfig.columnname,
            value: value,
            type: fieldConfig.type || 'text',
            label: fieldConfig.label,
            required: fieldConfig.required,
            placeholder: fieldConfig.placeholder
          };

          if (entityName === 'customfield') {
            structuredData.customData.push(fieldData);
          } else if (entityName === 'customobjectfield') {
            structuredData.customobjectfield.push(fieldData);
          } else {
            structuredData[entityName as keyof FormDataStructure].push(fieldData);
          }
        }
      });
    });

    dispatchChatEvent('contact:formCompleted', { formData: structuredData }, config);
    onFormComplete(structuredData);
  };

  const renderField = (field: PreChatFormField) => {
    if (field.type === 'select' && field.options) {
      return (
        <Select
          onValueChange={(value) => handleInputChange({ target: { name: `${field.entityname}.${field.columnname}`, value } }, field)}
        >
          <SelectTrigger className="pl-10">
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        id={`${field.entityname}.${field.columnname}`}
        name={`${field.entityname}.${field.columnname}`}
        type={field.type || 'text'}
        required={field.required}
        placeholder={field.placeholder}
        value={formData[field.entityname]?.[field.columnname] || ''}
        onChange={(e) => handleInputChange(e, field)}
        onBlur={() => setTouched(prev => ({
          ...prev,
          [`${field.entityname}.${columnname}`]: true
        }))}
        className={`pl-10 h-9 sm:h-10 transition-all text-xs sm:text-sm ${
          touched[`${field.entityname}.${field.columnname}`] &&
          formErrors[`${field.entityname}.${field.columnname}`]
            ? 'border-red-500 bg-red-50'
            : touched[`${field.entityname}.${field.columnname}`] &&
              !formErrors[`${field.entityname}.${field.columnname}`]
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200'
        }`}
      />
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 border border-gray-100 animate-fade-in w-full max-w-full sm:max-w-md mx-auto">
      <h3 className="text-center font-semibold mb-3 sm:mb-4 text-gray-700 text-sm sm:text-base">
        Please provide your information to continue
      </h3>

      <div className="space-y-3 sm:space-y-4">
        {sortedFields.map((field) => (
          <div key={`${field.entityname}.${field.columnname}`} className="space-y-1">
            <Label
              htmlFor={`${field.entityname}.${field.columnname}`}
              className="text-xs sm:text-sm font-medium flex items-center gap-1"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>

            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                {field.entityname === 'contact' && field.columnname === 'email' ? (
                  <AtSign className="text-gray-400 w-4 h-4" />
                ) : (
                  <User className="text-gray-400 w-4 h-4" />
                )}
              </div>

              {renderField(field)}
            </div>

            {touched[`${field.entityname}.${field.columnname}`] &&
              formErrors[`${field.entityname}.${field.columnname}`] && (
                <p
                  className="text-2xs sm:text-xs text-red-500 mt-1 animate-fade-in"
                >
                  {formErrors[`${field.entityname}.${field.columnname}`]}
                </p>
              )}
          </div>
        ))}
      </div>

      <div className="mt-4 sm:mt-6">
        <Button
          onClick={submitForm}
          disabled={!formValid}
          className="w-full h-9 sm:h-11 text-white transition-all text-xs sm:text-sm"
          style={{
            backgroundColor: config.colors?.primaryColor || '#8B5CF6',
            opacity: formValid ? 1 : 0.7
          }}
        >
          Start Chat
        </Button>

        <p className="text-2xs sm:text-xs text-center text-gray-500 mt-2 sm:mt-3">
          Your information helps us provide better assistance
        </p>
      </div>
    </div>
  );
};

export default PreChatForm;
