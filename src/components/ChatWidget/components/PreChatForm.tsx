import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { validateField, validateFormData, sanitizeInput } from '../utils/validation';
import { dispatchChatEvent } from '../utils/events';
import { ChatWidgetConfig, PreChatFormField } from '../config';
import { User, AtSign } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

// First, let's define our interfaces
export interface FormFieldData {
  entityname: string;
  columnname: string;
  value: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
}

export interface FormDataStructure {
  contact: FormFieldData[];
  company: FormFieldData[];
  customData: FormFieldData[];
}

interface PreChatFormProps {
  config: ChatWidgetConfig;
  onFormComplete: (formData: Record<string, string>) => void;
}

const PreChatForm = ({ config, onFormComplete }: PreChatFormProps) => {
  const [formData, setFormData] = useState<Record<string, Record<string, string>>>({
    contact: {},
    company: {},
    customData: {}
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formValid, setFormValid] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const isMobile = useIsMobile();

  // Handle input change for form
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: PreChatFormField
  ) => {
    const { value } = e.target;
    const { entityname, columnname } = field;

    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [`${entityname}.${columnname}`]: true
    }));

    // Validate this specific field
    const error = validateField(`${entityname}.${columnname}`, value, field.required || false);

    // Update error state
    setFormErrors(prev => ({
      ...prev,
      [`${entityname}.${columnname}`]: error || ''
    }));

    // Sanitize input before storing
    const sanitized = sanitizeInput(value);

    // Update form data
    setFormData(prev => ({
      ...prev,
      [entityname]: {
        ...prev[entityname],
        [columnname]: sanitized
      }
    }));

    validateFormCompletion({
      ...formData,
      [entityname]: {
        ...formData[entityname],
        [columnname]: sanitized
      }
    });
  };

  // Validate if the form is complete and valid
  const validateFormCompletion = (data: Record<string, any>) => {
    const allFields = [
      ...config.widgetfield.contactFields,
      ...config.widgetfield.companyFields,
      ...config.widgetfield.customDataFields
    ];

    const requiredFields = allFields.filter(field => field.required);

    const allRequiredFilled = requiredFields.every(field => {
      const { entityname, columnname } = field;
      const fieldValue = data[entityname]?.[columnname];
      return fieldValue &&
        fieldValue.trim() !== '' &&
        !validateField(`${entityname}.${columnname}`, fieldValue, true);
    });

    setFormValid(allRequiredFilled);
  };

  // Submit form
  const submitForm = () => {
    if (!formValid) return;

    const flatFormData: Record<string, string> = {};

    Object.entries(formData).forEach(([entityName, columnData]) => {
      Object.entries(columnData).forEach(([columnName, value]) => {
        if (entityName === 'contact') {
          if (columnName === 'email') {
            flatFormData.email = value;
          }
          if (columnName === 'firstname') {
            flatFormData.firstname = value;
          }
          if (columnName === 'lastname') {
            flatFormData.lastname = value;
          }
          if (columnName === 'name') {
            flatFormData.name = value;
          }
        }
        
        flatFormData[`${entityName}_${columnName}`] = value;
      });
    });

    dispatchChatEvent('contact:formCompleted', { formData: flatFormData }, config);
    onFormComplete(flatFormData);
  };

  // Compute primary color based on config or fallback
  const primaryColor = config.colors?.primaryColor || '#8B5CF6';

  // Handle blur event to mark field as touched
  const handleBlur = (field: string) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  // Get icon for input field
  const getFieldIcon = (fieldName: string) => {
    if (fieldName.includes('name') || fieldName.includes('first'))
      return <User className="text-gray-400 w-4 h-4" />;
    if (fieldName.includes('email'))
      return <AtSign className="text-gray-400 w-4 h-4" />;
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 border border-gray-100 animate-fade-in w-full max-w-full sm:max-w-md mx-auto">
      <h3 className="text-center font-semibold mb-3 sm:mb-4 text-gray-700 text-sm sm:text-base">
        {'Please provide your information to continue'}
      </h3>

      <div className="space-y-3 sm:space-y-4">
        {config.widgetfield.contactFields.map((field, index) => (
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
                {getFieldIcon(field.columnname)}
              </div>

              <Input
                id={`${field.entityname}.${field.columnname}`}
                name={`${field.entityname}.${field.columnname}`}
                type={field.type}
                required={field.required}
                placeholder={field.placeholder}
                value={formData[field.entityname]?.[field.columnname] || ''}
                onChange={(e) => handleInputChange(e, field)}
                onBlur={() => handleBlur(`${field.entityname}.${field.columnname}`)}
                className={`pl-10 h-9 sm:h-10 transition-all text-xs sm:text-sm ${touched[`${field.entityname}.${field.columnname}`] &&
                  formErrors[`${field.entityname}.${field.columnname}`]
                  ? 'border-red-500 bg-red-50'
                  : touched[`${field.entityname}.${field.columnname}`] &&
                    !formErrors[`${field.entityname}.${field.columnname}`]
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200'
                  }`}
                aria-describedby={
                  formErrors[`${field.entityname}.${field.columnname}`]
                    ? `${field.entityname}.${field.columnname}-error`
                    : undefined
                }
              />
            </div>

            {touched[`${field.entityname}.${field.columnname}`] &&
              formErrors[`${field.entityname}.${field.columnname}`] && (
                <p
                  id={`${field.entityname}.${field.columnname}-error`}
                  className="text-2xs sm:text-xs text-red-500 mt-1 animate-fade-in"
                >
                  {formErrors[`${field.entityname}.${field.columnname}`]}
                </p>
              )}
          </div>
        ))}

        {config.widgetfield.companyFields.map((field, index) => (
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
                {getFieldIcon(field.columnname)}
              </div>

              <Input
                id={`${field.entityname}.${field.columnname}`}
                name={`${field.entityname}.${field.columnname}`}
                type={field.type}
                required={field.required}
                placeholder={field.placeholder}
                value={formData[field.entityname]?.[field.columnname] || ''}
                onChange={(e) => handleInputChange(e, field)}
                onBlur={() => handleBlur(`${field.entityname}.${field.columnname}`)}
                className={`pl-10 h-9 sm:h-10 transition-all text-xs sm:text-sm ${touched[`${field.entityname}.${field.columnname}`] &&
                  formErrors[`${field.entityname}.${field.columnname}`]
                  ? 'border-red-500 bg-red-50'
                  : touched[`${field.entityname}.${field.columnname}`] &&
                    !formErrors[`${field.entityname}.${field.columnname}`]
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200'
                  }`}
                aria-describedby={
                  formErrors[`${field.entityname}.${field.columnname}`]
                    ? `${field.entityname}.${field.columnname}-error`
                    : undefined
                }
              />
            </div>

            {touched[`${field.entityname}.${field.columnname}`] &&
              formErrors[`${field.entityname}.${field.columnname}`] && (
                <p
                  id={`${field.entityname}.${field.columnname}-error`}
                  className="text-2xs sm:text-xs text-red-500 mt-1 animate-fade-in"
                >
                  {formErrors[`${field.entityname}.${field.columnname}`]}
                </p>
              )}
          </div>
        ))}

        {config.widgetfield.customDataFields.map((field, index) => (
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
                {getFieldIcon(field.columnname)}
              </div>

              <Input
                id={`${field.entityname}.${field.columnname}`}
                name={`${field.entityname}.${field.columnname}`}
                type={field.type}
                required={field.required}
                placeholder={field.placeholder}
                value={formData[field.entityname]?.[field.columnname] || ''}
                onChange={(e) => handleInputChange(e, field)}
                onBlur={() => handleBlur(`${field.entityname}.${field.columnname}`)}
                className={`pl-10 h-9 sm:h-10 transition-all text-xs sm:text-sm ${touched[`${field.entityname}.${field.columnname}`] &&
                  formErrors[`${field.entityname}.${field.columnname}`]
                  ? 'border-red-500 bg-red-50'
                  : touched[`${field.entityname}.${field.columnname}`] &&
                    !formErrors[`${field.entityname}.${field.columnname}`]
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200'
                  }`}
                aria-describedby={
                  formErrors[`${field.entityname}.${field.columnname}`]
                    ? `${field.entityname}.${field.columnname}-error`
                    : undefined
                }
              />
            </div>

            {touched[`${field.entityname}.${field.columnname}`] &&
              formErrors[`${field.entityname}.${field.columnname}`] && (
                <p
                  id={`${field.entityname}.${field.columnname}-error`}
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
            backgroundColor: primaryColor,
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
