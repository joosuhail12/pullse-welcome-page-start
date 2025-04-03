
import React from 'react';
import { Check, X, AlertCircle, Info } from 'lucide-react';
import { toast as useToast } from '@/components/ui/use-toast';
import { ToastAction, ToastActionElement } from '@/components/ui/toast';

interface ToastOptions {
  title?: string;
  action?: ToastActionElement;
  duration?: number;
  onDismiss?: () => void;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
}

export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

// Export toast for direct usage
export const toast = useToast;

// Map from ToastType to variant
const variantMap: Record<ToastType, "default" | "destructive" | "success" | "warning" | "info"> = {
  [ToastType.SUCCESS]: "success",
  [ToastType.ERROR]: "destructive",
  [ToastType.WARNING]: "warning",
  [ToastType.INFO]: "info"
};

/**
 * Show a toast notification with icon
 */
export function showToast(
  message: string,
  options: ToastOptions = {},
  type: ToastType = ToastType.INFO
) {
  const { title, action, duration = 5000, onDismiss, ...rest } = options;

  // Create icon elements using React.createElement
  const icons = {
    [ToastType.SUCCESS]: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
    [ToastType.ERROR]: React.createElement(X, { className: "h-4 w-4 text-red-500" }),
    [ToastType.WARNING]: React.createElement(AlertCircle, { className: "h-4 w-4 text-amber-500" }),
    [ToastType.INFO]: React.createElement(Info, { className: "h-4 w-4 text-blue-500" })
  };

  const toastAction = action as React.ReactElement | undefined;

  const toastInstance = useToast({
    title: title || getTitleFromType(type),
    description: React.createElement("div", { className: "flex items-start" },
      React.createElement("span", { className: "flex-shrink-0 mr-2 mt-0.5" }, icons[type]),
      React.createElement("span", { className: "font-normal" }, message)
    ),
    action: toastAction,
    duration,
    variant: variantMap[type],
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

// Export for convenience
export const toasts = {
  success: showSuccessToast,
  error: showErrorToast,
  warning: showWarningToast,
  info: showInfoToast,
  show: showToast
};
