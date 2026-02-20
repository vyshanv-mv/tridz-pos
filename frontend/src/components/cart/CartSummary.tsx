import { useMemo } from "react"
import { useCartStore, selectSubtotal, selectGrandTotal, calculateTaxBreakdown } from "@/store/cartStore"
import { usePosStore } from "@/store/posStore"
import { formatCurrency } from "@/lib/utils"

export function CartSummary() {
  const { profile } = usePosStore()
  const subtotal = useCartStore(selectSubtotal)
  const grandTotal = useCartStore((state) => selectGrandTotal(state, profile))
  const taxBreakdown = useMemo(() => calculateTaxBreakdown(subtotal, profile), [subtotal, profile])

  return (
    <div className="border-t border-border pt-4 space-y-2 text-sm text-muted-foreground">
      <div className="flex justify-between items-center">
        <span className="font-medium text-foreground">Subtotal:</span>
        <span className="text-foreground">{formatCurrency(subtotal)}</span>
      </div>

      {taxBreakdown.map((tax, index) => (
        <div key={index} className="flex justify-between items-center">
          <span className="font-medium text-foreground">{tax.title} ({tax.rate}%):</span>
          <span className="text-foreground">{formatCurrency(tax.amount)}</span>
        </div>
      ))}

      <div className="flex justify-between font-bold text-lg pt-2 border-t border-border text-foreground">
        <span>Grand Total:</span>
        <span className="text-primary">{formatCurrency(grandTotal)}</span>
      </div>
    </div>
  )
}
