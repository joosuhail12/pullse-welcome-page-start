
import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

export type ToastProps = React.ComponentPropsWithoutRef<typeof toast>;

// Re-export the toast from hooks for convenience
export { toast };

// Add any additional toast utility functions here
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((props: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prevToasts) => [...prevToasts, { ...props, id }]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    toast // Re-export the toast function for convenience
  };
};
