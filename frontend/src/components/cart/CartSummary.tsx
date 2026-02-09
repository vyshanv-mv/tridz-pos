import { useCartStore, selectSubtotal, selectGrandTotal } from "@/store/cartStore"
import { usePosStore } from "@/store/posStore"

export function CartSummary() {
  const { profile } = usePosStore()
  const subtotal = useCartStore(selectSubtotal)
  const grandTotal = useCartStore((state) => selectGrandTotal(state, profile))

  const taxes = profile?.taxes || []
  const hasTax = taxes.length > 0

  // Calculate net total for accurate tax display when inclusive taxes are used
  const totalInclusiveRate = taxes
    .filter((t: any) => t.included_in_print_rate)
    .reduce((sum: number, t: any) => sum + (t.rate || 0), 0)
  const netTotal = totalInclusiveRate > 0
    ? subtotal / (1 + totalInclusiveRate / 100)
    : subtotal

  return (
    <div className="border-t pt-4 space-y-2 text-sm text-emerald-950/80">
      <div className="flex justify-between">
        <span>Subtotal:</span>
        <span>₹{subtotal.toFixed(2)}</span>
      </div>

      {taxes.map((t, i) => (
        <div key={i} className="flex justify-between">
          <span>{t.description || t.account_head || 'Tax'} ({t.rate}%):</span>
          <span>₹{(netTotal * (t.rate / 100)).toFixed(2)}</span>
        </div>
      ))}

      {!hasTax && (
        <div className="flex justify-between">
          <span>Tax:</span>
          <span>₹0.00</span>
        </div>
      )}

      <div className="flex justify-between font-bold text-lg pt-2 border-t text-emerald-950">
        <span>Grand Total:</span>
        <span className="text-primary">₹{grandTotal.toFixed(2)}</span>
      </div>
    </div>
  )
}
