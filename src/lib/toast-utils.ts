
import { toast } from "@/hooks/use-toast"
import { createElement } from "react"
import { ToastActionElement, Toast } from "@/components/ui/toast";

type ToastType = 'info' | 'success' | 'warning' | 'error'

interface ToastOptions {
  title?: string
  description?: string
  duration?: number
  action?: ToastActionElement
  variant?: 'default' | 'destructive' | 'warning'
  dismissible?: boolean
}

// Enhanced toast function with resilience features
export const showToast = (
  type: ToastType, 
  options: ToastOptions = {}
) => {
  const { 
    title, 
    description, 
    duration = 5000,
    action,
    variant = type === 'error' ? 'destructive' : type === 'warning' ? 'warning' : 'default',
    dismissible = true
  } = options
  
  // Prevent duplicate toasts by generating an ID
  const toastId = title ? `${type}-${title.replace(/\s+/g, '-').toLowerCase()}` : undefined

  // Add a retry button for error toasts when provided with an action
  return toast({
    title,
    description,
    variant,
    duration,
    action,
    // These spread through to the underlying Toast component
    className: `toast-${type}`,
  })
}

// Convenience methods for each toast type
export const toasts = {
  info: (options: ToastOptions) => showToast('info', options),
  success: (options: ToastOptions) => showToast('success', options),
  warning: (options: ToastOptions) => showToast('warning', {
    variant: 'warning', 
    ...options
  }),
  error: (options: ToastOptions) => showToast('error', {
    variant: 'destructive', 
    ...options
  })
}

// Toast with retry action
export const retryableToast = (
  options: ToastOptions & { onRetry: () => void }
) => {
  const { onRetry, ...toastOptions } = options
  
  // Create a button element using the Button component
  const retryAction = createElement(
    'button',
    {
      className: "bg-secondary text-secondary-foreground hover:bg-secondary/80 px-2 py-1 rounded text-xs",
      onClick: () => {
        // Execute the retry action
        onRetry();
        // Dismiss the current toast
        toast.dismiss();
      }
    },
    'Retry'
  ) as unknown as ToastActionElement;
  
  return showToast('error', {
    ...toastOptions,
    action: retryAction,
    duration: 10000 // Give more time for user to decide to retry
  })
}
