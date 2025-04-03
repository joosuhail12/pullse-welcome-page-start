
import React from 'react';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

// Define a type for the action props
interface ActionProps {
  label: string;
  onClick: () => void;
}

/**
 * Show a success toast
 */
export const showSuccessToast = (
  title: string,
  description?: string,
  options?: {
    duration?: number;
    action?: ActionProps;
  }
) => {
  return toast({
    title,
    description,
    duration: options?.duration ?? 5000,
    variant: 'default',
    action: options?.action ? (
      <ToastAction altText={options.action.label} onClick={options.action.onClick}>
        {options.action.label}
      </ToastAction>
    ) : undefined
  });
};

/**
 * Show an error toast
 */
export const showErrorToast = (
  title: string,
  description?: string,
  options?: {
    duration?: number;
    action?: ActionProps;
  }
) => {
  return toast({
    title,
    description,
    duration: options?.duration ?? 5000,
    variant: 'destructive',
    action: options?.action ? (
      <ToastAction altText={options.action.label} onClick={options.action.onClick}>
        {options.action.label}
      </ToastAction>
    ) : undefined
  });
};

/**
 * Show a warning toast
 */
export const showWarningToast = (
  title: string,
  description?: string,
  options?: {
    duration?: number;
    action?: ActionProps;
  }
) => {
  return toast({
    title,
    description,
    duration: options?.duration ?? 5000,
    variant: 'warning',
    action: options?.action ? (
      <ToastAction altText={options.action.label} onClick={options.action.onClick}>
        {options.action.label}
      </ToastAction>
    ) : undefined
  });
};

/**
 * Show an info toast
 */
export const showInfoToast = (
  title: string,
  description?: string,
  options?: {
    duration?: number;
    action?: ActionProps;
  }
) => {
  return toast({
    title,
    description,
    duration: options?.duration ?? 5000,
    variant: 'info',
    action: options?.action ? (
      <ToastAction altText={options.action.label} onClick={options.action.onClick}>
        {options.action.label}
      </ToastAction>
    ) : undefined
  });
};

/**
 * Utility to show different types of toasts
 */
export const toasts = {
  success: (options: {
    title: string;
    description?: string;
    duration?: number;
    action?: ActionProps;
  }) => {
    return showSuccessToast(options.title, options.description, {
      duration: options.duration,
      action: options.action
    });
  },
  
  error: (options: {
    title: string;
    description?: string;
    duration?: number;
    action?: ActionProps;
  }) => {
    return showErrorToast(options.title, options.description, {
      duration: options.duration,
      action: options.action
    });
  },
  
  warning: (options: {
    title: string;
    description?: string;
    duration?: number;
    action?: ActionProps;
  }) => {
    return showWarningToast(options.title, options.description, {
      duration: options.duration,
      action: options.action
    });
  },
  
  info: (options: {
    title: string;
    description?: string;
    duration?: number;
    action?: ActionProps;
  }) => {
    return showInfoToast(options.title, options.description, {
      duration: options.duration,
      action: options.action
    });
  }
};
