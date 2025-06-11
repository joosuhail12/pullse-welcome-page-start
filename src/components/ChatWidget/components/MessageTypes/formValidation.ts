
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

export const validateFormField = (field: { id: string; type: string; label: string; required?: boolean }, value: string): string => {
  if (field.required && !value.trim()) {
    return `${field.label} is required`;
  }
  
  if (!value) return '';
  
  switch (field.type) {
    case 'email':
      return !isValidEmail(value) ? 'Please enter a valid email address' : '';
    case 'url':
      return !isValidURL(value) ? 'Please enter a valid URL' : '';
    case 'phone':
      return !isValidPhone(value) ? 'Please enter a valid phone number' : '';
    case 'number':
      return isNaN(Number(value)) ? 'Please enter a valid number' : '';
    default:
      return '';
  }
};
