
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
  });
};

toast.error = (content, options = {}) => {
  return toast({
    title: "Error",
    description: content,
    variant: "destructive",
    ...options,
  });
};

toast.info = (content, options = {}) => {
  return toast({
    title: "Info",
    description: content,
    variant: "default",
    ...options,
  });
};

toast.warning = (content, options = {}) => {
  return toast({
    title: "Warning",
    description: content,
    variant: "default",
    ...options,
  });
};

toast.loading = (content, options = {}) => {
  return toast({
    title: "Loading",
    description: content,
    variant: "default",
    ...options,
  });
};

// Export the extended toast function and the original useToast hook
export { toast, useToastOriginal as useToast };
