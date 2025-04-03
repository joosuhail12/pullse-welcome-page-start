
import React, { ReactNode } from 'react';
import { toast, ToastProps } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';

// Define the types for action buttons
type ToastActionProps = {
  label: string;
  onClick: () => void;
  className?: string;
};

/**
 * Enhanced toast utilities with consistent styling and improved accessibility.
 */

export const showSuccessToast = (
  title: string,
  description?: string,
  action?: ToastActionProps
) => {
  return toast({
    title,
    description,
    variant: 'default',
    className: 'bg-green-50 border-green-200',
    action: action ? (
      <ToastAction altText={action.label} onClick={action.onClick} className={action.className}>
        {action.label}
      </ToastAction>
    ) : undefined,
    type: 'success',
  });
};

export const showErrorToast = (
  title: string,
  description?: string,
  action?: ToastActionProps
) => {
  return toast({
    title,
    description,
    variant: 'destructive',
    action: action ? (
      <ToastAction altText={action.label} onClick={action.onClick} className={action.className}>
        {action.label}
      </ToastAction>
    ) : undefined,
    type: 'error',
  });
};

export const showWarningToast = (
  title: string,
  description?: string,
  action?: ToastActionProps
) => {
  return toast({
    title,
    description,
    variant: 'default',
    className: 'bg-yellow-50 border-yellow-200',
    action: action ? (
      <ToastAction altText={action.label} onClick={action.onClick} className={action.className}>
        {action.label}
      </ToastAction>
    ) : undefined,
    type: 'warning',
  });
};

export const showInfoToast = (
  title: string,
  description?: string,
  action?: ToastActionProps
) => {
  return toast({
    title,
    description,
    variant: 'default',
    className: 'bg-blue-50 border-blue-200',
    action: action ? (
      <ToastAction altText={action.label} onClick={action.onClick} className={action.className}>
        {action.label}
      </ToastAction>
    ) : undefined,
    type: 'info',
  });
};

// Loading toast with auto-dismiss when complete
export const showLoadingToast = (
  loadingMessage: string,
  promise: Promise<any>,
  successMessage: string,
  errorMessage: string
) => {
  const toastInstance = toast({
    title: loadingMessage,
    description: 'Please wait...',
    duration: Infinity,
  });
  
  promise
    .then(() => {
      toast({
        id: toastInstance.id,
        title: successMessage,
        description: '',
        variant: 'default',
        className: 'bg-green-50 border-green-200',
        type: 'success',
      });
    })
    .catch((error) => {
      toast({
        id: toastInstance.id,
        title: errorMessage,
        description: error.message || 'An error occurred',
        variant: 'destructive',
        type: 'error',
      });
    });
    
  return toastInstance;
};
