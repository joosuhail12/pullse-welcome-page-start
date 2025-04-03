
import { useState, useEffect, useCallback } from "react";
import { toast as originalToast } from "@/hooks/use-toast";

export type ToastProps = Parameters<typeof originalToast>[0];

// Re-export the toast from hooks for convenience
export { toast } from "@/hooks/use-toast";

// Add any additional toast utility functions here
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((props: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9);
    const toastWithId = { ...props, id };
    setToasts((prevToasts) => [...prevToasts, toastWithId]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    toast: originalToast // Re-export the toast function for convenience
  };
};
