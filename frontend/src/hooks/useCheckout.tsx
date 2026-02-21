import { useState } from "react"
import { usePosStore } from "@/store/posStore"
import { useCartStore, selectActiveItems, selectGrandTotal } from "@/store/cartStore"
import { useInvoiceStore } from "@/store/invoiceStore"
import { createDraftPOSInvoice, submitInvoice } from "@/api/invoice"
import { printERPNextDoc } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import type { Customer } from "@/types/customer"
import type { Payment } from "@/types/invoice"

export function useCheckout() {
    const [isProcessing, setIsProcessing] = useState(false)
    const { profile, openingEntry } = usePosStore()
    const { orders, activeOrderId, newOrder, closeOrder } = useCartStore()
    const activeItems = useCartStore(selectActiveItems)
    const grandTotal = useCartStore((state) => selectGrandTotal(state, profile))
    const setDraftInvoice = useInvoiceStore(s => s.setDraftInvoice)
    const { toast } = useToast()

    const processPayment = async (payments: Payment[], customer?: Customer) => {
        if (!profile) {
            toast({
                title: "Error",
                description: "Session lost or invalid state",
                variant: "destructive",
            })
            return null
        }

        setIsProcessing(true)
        const activeOrder = orders.find(o => o.id === activeOrderId)

        try {
            // Client-side validation: SUM(payments) === grandTotal
            const paymentsTotal = Math.round(payments.reduce((sum, p) => sum + p.amount, 0))
            const roundedGrandTotal = Math.round(grandTotal)

            if (paymentsTotal !== roundedGrandTotal) {
                throw new Error(`POS payment (${paymentsTotal}) must equal grand total (${roundedGrandTotal})`)
            }

            // Create draft invoice
            const invoiceData = {
                customer: customer?.name || profile.customer || "Walk In Customer",
                company: profile.company,
                pos_profile: profile.name,
                pos_opening_entry: openingEntry?.name || "",
                currency: profile.currency,
                warehouse: profile.warehouse,
                items: activeItems as any,
                payments,
                taxes: profile.taxes,
                taxes_and_charges: profile.taxes_and_charges,
                return_against: activeOrder?.return_against,
                grand_total: grandTotal
            }

            const invoice = await createDraftPOSInvoice(invoiceData)

            if (invoice?.name) {
                await submitInvoice(invoice.name)
                setDraftInvoice(invoice.name)

                // Only print if enabled in POS Profile
                if (profile.print_receipt_on_order_complete) {
                    printERPNextDoc({
                        doctype: "POS Invoice",
                        name: invoice.name,
                        format: profile.print_format || "POS Invoice"
                    })
                }
            }

            toast({
                title: "Order processed successfully",
            })

            // Close the current order tab
            if (orders.length === 1) {
                newOrder()
                closeOrder(activeOrderId)
            } else {
                closeOrder(activeOrderId)
            }

            return invoice

        } catch (error: any) {
            console.error("Checkout failed:", error)
            toast({
                title: "Checkout Failed",
                description: error.message || "Failed to process order",
                variant: "destructive",
            })
            return null
        } finally {
            setIsProcessing(false)
        }
    }

    return {
        processPayment,
        isProcessing
    }
}
