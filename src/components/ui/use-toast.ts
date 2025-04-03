
import { useToast as useToastOriginal, toast as toastOriginal } from "@/hooks/use-toast";
import { type ToastProps } from "@/components/ui/toast";

// Re-export the toast and useToast from the hooks directory
export { toast, useToast } from "@/hooks/use-toast";

// These type definitions ensure backward compatibility
export type {
  ToastProps,
  ToastActionElement
} from "@/components/ui/toast";
