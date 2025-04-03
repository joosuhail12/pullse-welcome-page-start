
import { ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

type ToastVariant = 'default' | 'destructive' | 'success' | 'warning';

interface ToastOptions {
  title?: string;
  description: string;
  duration?: number;
  variant?: ToastVariant;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Toast utility for showing notifications
 */
export const toasts = {
  /**
   * Show a success toast notification
   */
  success: ({
    title = 'Success',
    description,
    duration = 5000,
    action
  }: ToastOptions) => {
    return toast({
      title,
      description,
      variant: 'success',
      duration,
      action
    });
  },

  /**
   * Show an error toast notification
   */
  error: ({
    title = 'Error',
    description,
    duration = 5000,
    action
  }: ToastOptions) => {
    return toast({
      title,
      description,
      variant: 'destructive',
      duration,
      action
    });
  },

  /**
   * Show an informational toast notification
   */
  info: ({
    title = 'Information',
    description,
    duration = 5000,
    action
  }: ToastOptions) => {
    return toast({
      title,
      description,
      variant: 'default',
      duration,
      action
    });
  },

  /**
   * Show a warning toast notification
   */
  warning: ({
    title = 'Warning',
    description,
    duration = 5000,
    action
  }: ToastOptions) => {
    return toast({
      title,
      description,
      variant: 'warning',
      duration,
      action
    });
  },

  /**
   * Show a custom toast notification
   */
  custom: ({
    title,
    description,
    duration = 5000,
    variant = 'default',
    action
  }: ToastOptions & { variant?: ToastVariant }) => {
    return toast({
      title,
      description,
      variant,
      duration,
      action
    });
  },

  /**
   * Show a loading toast notification that can be updated
   */
  loading: (message: string) => {
    return toast({
      description: message,
      duration: null, // Loading toasts should stay until manually dismissed
    });
  }
};
