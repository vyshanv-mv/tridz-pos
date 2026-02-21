import { Button } from "@/components/ui/button"
import { Trash2, Plus, Minus } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { usePosStore } from "@/store/posStore"

interface CartItemProps {
    item_code: string
    item_name: string
    qty: number
    rate: number
    onRemove: () => void
    onAdd: () => void
    onReduce: () => void
}

export function CartItem({
    item_code,
    item_name,
    qty,
    rate,
    onRemove,
    onAdd,
    onReduce
}: CartItemProps) {
    const total = qty * rate
    const { profile } = usePosStore()

    return (
        <div className="bg-muted/20 rounded-lg p-3 mb-2 border border-transparent hover:border-border transition-colors">
            {/* Header: Name & Delete */}
            <div className="flex justify-between items-start mb-1">
                <h4 className="font-medium text-sm text-foreground line-clamp-2 pr-2">
                    {item_name}
                </h4>
                <button
                    onClick={onRemove}
                    className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 p-1 rounded transition-colors"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

            {/* Sub-header: Code & Unit Price */}
            <div className="text-xs text-muted-foreground mb-3">
                <div className="uppercase tracking-wide text-xs text-muted-foreground font-medium mb-0.5">
                    {item_code}
                </div>
                <div>{formatCurrency(rate, profile?.currency)} each</div>
            </div>

            {/* Controls Row */}
            <div className="flex justify-between items-center">
                {/* Stepper */}
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-card border-input text-muted-foreground hover:text-foreground"
                        onClick={onReduce}
                    >
                        <Minus className="h-3 w-3" />
                    </Button>

                    <div className="h-8 w-10 flex items-center justify-center bg-card border border-input rounded text-sm font-medium text-foreground">
                        {qty}
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-card border-input text-muted-foreground hover:text-foreground"
                        onClick={onAdd}
                    >
                        <Plus className="h-3 w-3" />
                    </Button>
                </div>

                {/* Total Price */}
                <div className="font-bold text-base text-primary">
                    {formatCurrency(total, profile?.currency)}
                </div>
            </div>
        </div>
    )
}
