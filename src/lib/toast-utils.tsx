
import React, { ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
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

// Create an object for exported toast functions
export const toasts = {
  success: (options: {
    title: string;
    description?: string;
    action?: ToastActionProps;
    duration?: number;
  }) => {
    return toast({
      title: options.title,
      description: options.description,
      variant: 'default',
      className: 'bg-green-50 border-green-200',
      type: 'success',
      duration: options.duration,
      action: options.action ? (
        <ToastAction altText={options.action.label} onClick={options.action.onClick} className={options.action.className}>
          {options.action.label}
        </ToastAction>
      ) : undefined,
    });
  },

  error: (options: {
    title: string;
    description?: string;
    action?: ToastActionProps;
    duration?: number;
  }) => {
    return toast({
      title: options.title,
      description: options.description,
      variant: 'destructive',
      type: 'error',
      duration: options.duration,
      action: options.action ? (
        <ToastAction altText={options.action.label} onClick={options.action.onClick} className={options.action.className}>
          {options.action.label}
        </ToastAction>
      ) : undefined,
    });
  },

  warning: (options: {
    title: string;
    description?: string;
    action?: ToastActionProps;
    duration?: number;
  }) => {
    return toast({
      title: options.title,
      description: options.description,
      variant: 'default',
      type: 'warning',
      duration: options.duration,
      className: 'bg-yellow-50 border-yellow-200',
      action: options.action ? (
        <ToastAction altText={options.action.label} onClick={options.action.onClick} className={options.action.className}>
          {options.action.label}
        </ToastAction>
      ) : undefined,
    });
  },

  info: (options: {
    title: string;
    description?: string;
    action?: ToastActionProps;
    duration?: number;
  }) => {
    return toast({
      title: options.title,
      description: options.description,
      variant: 'default',
      type: 'info',
      duration: options.duration,
      className: 'bg-blue-50 border-blue-200',
      action: options.action ? (
        <ToastAction altText={options.action.label} onClick={options.action.onClick} className={options.action.className}>
          {options.action.label}
        </ToastAction>
      ) : undefined,
    });
  },

  loading: (
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
  }
};

// For backwards compatibility
export const showSuccessToast = (title: string, description?: string, action?: ToastActionProps) => {
  return toasts.success({ title, description, action });
};

export const showErrorToast = (title: string, description?: string, action?: ToastActionProps) => {
  return toasts.error({ title, description, action });
};

export const showWarningToast = (title: string, description?: string, action?: ToastActionProps) => {
  return toasts.warning({ title, description, action });
};

export const showInfoToast = (title: string, description?: string, action?: ToastActionProps) => {
  return toasts.info({ title, description, action });
};

export const showLoadingToast = (
  loadingMessage: string,
  promise: Promise<any>,
  successMessage: string,
  errorMessage: string
) => {
  return toasts.loading(loadingMessage, promise, successMessage, errorMessage);
};
