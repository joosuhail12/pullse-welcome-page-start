
import { toast } from "@/hooks/use-toast"

type ToastType = 'info' | 'success' | 'warning' | 'error'

interface ToastOptions {
  title?: string
  description?: string
  duration?: number
}

export const showToast = (
  type: ToastType, 
  options: ToastOptions = {}
) => {
  const { 
    title, 
    description, 
    duration = 5000 
  } = options

  return toast({
    title,
    description,
    type,
    duration
  })
}

// Convenience methods for each toast type
export const toasts = {
  info: (options: ToastOptions) => showToast('info', options),
  success: (options: ToastOptions) => showToast('success', options),
  warning: (options: ToastOptions) => showToast('warning', options),
  error: (options: ToastOptions) => showToast('error', options)
}
