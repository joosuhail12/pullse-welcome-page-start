
import { useToast as useToastOriginal, toast as toastOriginal } from "@/hooks/use-toast";
import { type ToastProps } from "@/components/ui/toast";

// Extend the toast function with helper methods
interface ExtendedToast {
  (props: ToastProps): ReturnType<typeof toastOriginal>;
  success: (content: string, options?: Partial<ToastProps>) => ReturnType<typeof toastOriginal>;
  error: (content: string, options?: Partial<ToastProps>) => ReturnType<typeof toastOriginal>;
  info: (content: string, options?: Partial<ToastProps>) => ReturnType<typeof toastOriginal>;
  warning: (content: string, options?: Partial<ToastProps>) => ReturnType<typeof toastOriginal>;
  loading: (content: string, options?: Partial<ToastProps>) => ReturnType<typeof toastOriginal>;
}

// Create extended toast function
const toast = toastOriginal as ExtendedToast;

// Add helper methods
toast.success = (content, options = {}) => {
  return toast({
    title: "Success",
    description: content,
    variant: "default",
    ...options,
  } as ToastProps); // Cast to ToastProps to fix type issues
};

toast.error = (content, options = {}) => {
  return toast({
    title: "Error",
    description: content,
    variant: "destructive",
    ...options,
  } as ToastProps);
};

toast.info = (content, options = {}) => {
  return toast({
    title: "Info",
    description: content,
    variant: "default",
    ...options,
  } as ToastProps);
};

toast.warning = (content, options = {}) => {
  return toast({
    title: "Warning",
    description: content,
    variant: "default",
    ...options,
  } as ToastProps);
};

toast.loading = (content, options = {}) => {
  return toast({
    title: "Loading",
    description: content,
    variant: "default",
    ...options,
  } as ToastProps);
};

// Export the extended toast function and the original useToast hook
export { toast, useToastOriginal as useToast };
