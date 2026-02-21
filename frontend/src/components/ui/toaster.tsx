import { CheckCircle2, AlertCircle } from "lucide-react"
import {
    Toast,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
    const { toasts } = useToast()

    return (
        <ToastProvider>
            {toasts.map(function ({ id, title, description, action, variant, ...props }) {
                const isDestructive = variant === "destructive"
                return (
                    <Toast key={id} variant={variant} {...props}>
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                            {isDestructive ? (
                                <AlertCircle className="h-5 w-5 text-red-500" />
                            ) : (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                            )}
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0 pr-4">
                            {title && <ToastTitle>{title}</ToastTitle>}
                            {description && (
                                <ToastDescription>{description}</ToastDescription>
                            )}
                        </div>
                        {action}
                        <ToastClose />
                    </Toast>
                )
            })}
            <ToastViewport />
        </ToastProvider>
    )
}
