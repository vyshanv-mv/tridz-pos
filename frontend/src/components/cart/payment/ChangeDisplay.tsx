import { cn } from "@/lib/utils"

interface ChangeDisplayProps {
    amount: string
    total: number
}

export function ChangeDisplay({ amount, total }: ChangeDisplayProps) {
    const currentAmount = parseFloat(amount) || 0
    const balance = currentAmount - total
    const isChange = balance >= 0
    const displayAmount = Math.abs(balance)

    if (Math.abs(currentAmount - total) <= 0.01) return null

    return (
        <div className={cn(
            "border rounded-lg p-4 flex justify-between items-center mb-2 animate-in fade-in slide-in-from-top-2",
            isChange
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                : "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
        )}>
            <span className={cn("font-semibold",
                isChange ? "text-green-800 dark:text-green-300" : "text-orange-800 dark:text-orange-300"
            )}>
                {isChange ? "Change to Return:" : "Balance Due:"}
            </span>
            <span className={cn("font-bold text-xl",
                isChange ? "text-green-800 dark:text-green-300" : "text-orange-800 dark:text-orange-300"
            )}>
                ₹{displayAmount.toFixed(2)}
            </span>
        </div>
    )
}
