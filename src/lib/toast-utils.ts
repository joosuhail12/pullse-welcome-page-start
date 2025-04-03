
import { toast } from "@/hooks/use-toast"
import React from "react"
import { ToastAction } from "@/components/ui/toast"
import { ToastActionElement } from "@/components/ui/toast"

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
  
  return toast({
    title,
    description,
    variant,
    duration,
    action,
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
  
  // Create a proper ToastAction component instead of using createElement directly
  const retryAction = (
    <ToastAction altText="Retry" onClick={onRetry}>
      Retry
    </ToastAction>
  ) as ToastActionElement
  
  return showToast('error', {
    ...toastOptions,
    action: retryAction,
    duration: 10000 // Give more time for user to decide to retry
  })
}
