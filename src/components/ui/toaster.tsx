
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

export function Toaster() {
  const { toasts } = useToast()

  const getIcon = (type?: string) => {
    switch(type) {
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-primary" />;
    }
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, type, ...props }) {
        return (
          <Toast 
            key={id} 
            {...props} 
            className={`
              ${props.className || ''} 
              flex items-center space-x-3 
              border-l-4 
              ${type === 'error' ? 'border-l-destructive bg-destructive/10' : 
                type === 'success' ? 'border-l-green-500 bg-green-50' : 
                type === 'warning' ? 'border-l-yellow-500 bg-yellow-50' : 
                'border-l-primary bg-primary/10'}
            `}
          >
            <div className="flex items-center space-x-3">
              {getIcon(type)}
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose className="ml-auto" />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
