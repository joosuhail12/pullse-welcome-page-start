
import React, { ReactElement } from 'react';
import { Check, X, AlertCircle, Info } from 'lucide-react';
import { toast, ToastProps } from '@/components/ui/toast';
import { ToastAction, ToastActionElement } from '@/components/ui/toast';

interface ToastOptions extends Omit<ToastProps, 'action'> {
  action?: ToastActionElement;
  onDismiss?: () => void;
}

export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

/**
 * Show a toast notification with icon
 */
export function showToast(
  message: string,
  options: ToastOptions = {},
  type: ToastType = ToastType.INFO
) {
  const { title, action, duration = 5000, onDismiss, ...rest } = options;

  const icons = {
    [ToastType.SUCCESS]: <Check className="h-4 w-4 text-green-500" />,
    [ToastType.ERROR]: <X className="h-4 w-4 text-red-500" />,
    [ToastType.WARNING]: <AlertCircle className="h-4 w-4 text-amber-500" />,
    [ToastType.INFO]: <Info className="h-4 w-4 text-blue-500" />
  };

  const toastAction = action as ReactElement | undefined;

  const toastInstance = toast({
    title: title || getTitleFromType(type),
    description: (
      <div className="flex items-start">
        <span className="flex-shrink-0 mr-2 mt-0.5">{icons[type]}</span>
        <span className="font-normal">{message}</span>
      </div>
    ),
    action: toastAction,
    duration,
    ...rest
  });
  
  if (onDismiss) {
    setTimeout(() => {
      onDismiss();
    }, duration);
  }

  return toastInstance;
}

/**
 * Show a success toast
 */
export function showSuccessToast(message: string, options: ToastOptions = {}) {
  return showToast(message, options, ToastType.SUCCESS);
}

/**
 * Show an error toast
 */
export function showErrorToast(message: string, options: ToastOptions = {}) {
  return showToast(message, options, ToastType.ERROR);
}

/**
 * Show a warning toast
 */
export function showWarningToast(message: string, options: ToastOptions = {}) {
  return showToast(message, options, ToastType.WARNING);
}

/**
 * Show an info toast
 */
export function showInfoToast(message: string, options: ToastOptions = {}) {
  return showToast(message, options, ToastType.INFO);
}

/**
 * Get default title based on toast type
 */
function getTitleFromType(type: ToastType): string {
  switch (type) {
    case ToastType.SUCCESS:
      return 'Success';
    case ToastType.ERROR:
      return 'Error';
    case ToastType.WARNING:
      return 'Warning';
    case ToastType.INFO:
      return 'Information';
    default:
      return 'Notification';
  }
}
