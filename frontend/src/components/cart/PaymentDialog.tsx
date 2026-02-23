import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cartStore"
import { usePosStore } from "@/store/posStore"
import type { Payment } from "@/types/invoice"
import { Printer } from "lucide-react"
import type { Customer } from "@/types/customer"
import { CustomerSearch } from "./payment/CustomerSearch"
import { PaymentModeGrid } from "./payment/PaymentModeGrid"
import { AmountControl } from "./payment/AmountControl"
import { ChangeDisplay } from "./payment/ChangeDisplay"
import { formatCurrency } from "@/lib/utils"

interface PaymentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    total: number
    subtotal: number
    taxBreakdown: { title: string, rate: number, amount: number }[]
    onConfirm: (payments: Payment[], customer?: Customer) => Promise<void>
}

export function PaymentDialog({
    open,
    onOpenChange,
    total,
    subtotal,
    taxBreakdown,
    onConfirm,
}: PaymentDialogProps) {
    const { profile } = usePosStore()
    const { setCustomer, activeOrderId, orders } = useCartStore()
    const activeOrder = orders.find(o => o.id === activeOrderId)

    const [amount, setAmount] = useState<string>("")
    const [selectedMode, setSelectedMode] = useState<string>("")
    const [processing, setProcessing] = useState(false)

    // Initialize with default payment mode and total amount when opened
    useEffect(() => {
        if (open && profile) {
            setAmount(total.toFixed(2)) // Initialize with exact amount
            const defaultMode = profile.payments.find(p => p.default)?.mode_of_payment || "Cash"
            setSelectedMode(defaultMode)
        }
        // Customer is managed by store now
    }, [open, total, profile])

    const handleConfirm = async () => {
        if (!selectedMode || !amount) return

        try {
            setProcessing(true)
            const payAmount = parseFloat(amount) || 0

            // Round to 2 decimal places to avoid floating point issues
            const round = (val: number) => Math.round(val * 100) / 100

            const roundedPayAmount = round(payAmount)
            const roundedTotal = round(total)

            // For POS, payment must be equal to or greater than total (change is handled by ERPNext/UI)
            // But the amount sent to the POS Invoice 'payments' table MUST sum exactly to grand_total
            if (Math.abs(roundedPayAmount) < Math.abs(roundedTotal)) {
                alert("Partial payments are not allowed. Please enter the full amount.")
                setProcessing(false)
                return
            }

            // We always record exactly the grand total in the payments table for POS
            // (The difference is considered 'change' and is not usually in the payments table unless specifically tracked)
            const payments: Payment[] = [{
                mode_of_payment: selectedMode,
                amount: total // Use exactly the total (grand total)
            }]

            await onConfirm(payments, activeOrder?.customer)
            onOpenChange(false)
        } catch (error) {
            console.error("Payment failed", error)
        } finally {
            setProcessing(false)
        }
    }

    if (!profile) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="fixed z-50 flex flex-col w-[calc(100%-2rem)] h-[90vh] max-w-3xl rounded-2xl border-0 p-4 sm:p-0 sm:h-auto sm:max-w-3xl sm:border sm:gap-0 bg-background">
                <div className="flex-1 overflow-y-auto px-2 py-4 sm:p-6 pb-2">
                    <DialogHeader className="mb-4">
                        <div className="flex items-center gap-2">
                            <DialogTitle className="text-xl">Checkout</DialogTitle>
                            {activeOrder?.return_against && (
                                <span className="px-2 py-0.5 text-xs font-bold bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300 rounded-md uppercase">
                                    Return
                                </span>
                            )}
                        </div>
                        <DialogDescription>
                            Enter payment details and confirm to process the payment.
                        </DialogDescription>
                    </DialogHeader>

                    <CustomerSearch
                        selectedCustomer={activeOrder?.customer}
                        onSelect={setCustomer}
                    />

                    <PaymentModeGrid
                        modes={profile.payments}
                        selectedMode={selectedMode}
                        onSelect={setSelectedMode}
                    />

                    {/* Totals Breakdown */}
                    <div className="bg-muted/20 p-4 rounded-lg space-y-2 mb-6">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Subtotal:</span>
                            <span className="font-medium">{formatCurrency(subtotal, profile.currency)}</span>
                        </div>
                        {taxBreakdown.map((tax, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">{tax.title} ({tax.rate}%):</span>
                                <span className="font-medium">{formatCurrency(tax.amount, profile.currency)}</span>
                            </div>
                        ))}
                        <div className="pt-2 border-t border-muted-foreground/20 flex justify-between items-center">
                            <span className="text-muted-foreground">Grand Total:</span>
                            <span className="font-bold text-lg">{formatCurrency(total, profile.currency)}</span>
                        </div>
                    </div>

                    <AmountControl
                        amount={amount}
                        setAmount={setAmount}
                        total={total}
                        currency={profile.currency}
                    />

                    <ChangeDisplay
                        amount={amount}
                        total={total}
                        currency={profile.currency}
                    />
                </div>

                <DialogFooter className="px-2 py-4 sm:p-6 pt-2 bg-background sm:bg-background border-t sm:border-t-0 mt-auto flex-row gap-3">
                    <Button
                        variant="outline"
                        className="h-12 flex-1 rounded-xl border-input text-muted-foreground hover:bg-muted text-base font-medium"
                        onClick={() => onOpenChange(false)}
                        disabled={processing}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="h-12 flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-xl text-base font-medium shadow-sm"
                        onClick={handleConfirm}
                        disabled={processing || !selectedMode || !activeOrder?.customer}
                    >
                        <Printer className="h-5 w-5" />
                        {processing ? "Processing..." : "Confirm & Print"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
