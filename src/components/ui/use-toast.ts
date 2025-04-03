
import { useState, useCallback } from 'react';

export interface Toast {
  id?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  duration?: number;
}

export type ToasterToast = Toast;

export const useToast = () => {
  const [toasts, setToasts] = useState<ToasterToast[]>([]);

  const toast = useCallback(
    ({ ...props }: Toast) => {
      const id = Math.random().toString(36).substring(2, 9);
      
      setToasts((prevToasts) => [
        ...prevToasts,
        { id, ...props },
      ]);

      return {
        id,
        dismiss: () => setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id)),
        update: (props: ToasterToast) =>
          setToasts((prevToasts) =>
            prevToasts.map((toast) =>
              toast.id === id ? { ...toast, ...props } : toast
            )
          ),
      };
    },
    []
  );

  const dismiss = useCallback((toastId?: string) => {
    setToasts((prevToasts) =>
      toastId
        ? prevToasts.filter((toast) => toast.id !== toastId)
        : []
    );
  }, []);

  return {
    toast,
    dismiss,
    toasts,
  };
};

export const toast = (props: Toast) => {
  // Basic implementation for direct usage in library code
  console.log('Toast:', props);
  // In a real implementation, this would trigger a toast UI
};
