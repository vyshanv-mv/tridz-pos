import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Loader2, CreditCard } from "lucide-react"

interface InvoiceDetailViewProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    loadingDetails: boolean
    selectedInvoiceInfo: any
    onBack: () => void
    formatCurrency: (amount: number) => string
}

export function InvoiceDetailView({
    open,
    onOpenChange,
    loadingDetails,
    selectedInvoiceInfo,
    onBack,
    formatCurrency
}: InvoiceDetailViewProps) {
    // Calculate subtotal and tax
    const subtotal = selectedInvoiceInfo?.items?.reduce((sum: number, item: any) =>
        sum + (item.rate * Math.abs(item.qty)), 0) || 0
    const tax = (selectedInvoiceInfo?.total_taxes_and_charges || 0)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl w-[95%] max-h-[90vh] p-0 gap-0 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
                {loadingDetails ? (
                    <div className="flex-1 flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="px-4 py-2 border-b border-border flex items-start justify-between shrink-0">
                            <div>
                                <h2 className="text-xl font-semibold text-foreground">{selectedInvoiceInfo.name}</h2>
                                <p className="text-sm text-muted-foreground mt-1">Invoice details</p>
                            </div>
                        </div>

                        {/* invoice Detial Content */}
                        <div className="flex-1 flex flex-col overflow-hidden ">
                            <div className="px-4 py-2 space-y-4 shrink-0 ">
                                {/* Invoice Info Container - includes header, customer, and payment details */}
                                <div className="p-4 bg-muted/10 rounded-lg space-y-2">
                                    {/* Invoice Number and Date with Status */}
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-base font-semibold text-foreground">{selectedInvoiceInfo.name}</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {selectedInvoiceInfo.posting_date} at {selectedInvoiceInfo.posting_time?.substring(0, 5) || '00:00'} am
                                            </p>
                                        </div>
                                        <div>
                                            {selectedInvoiceInfo.docstatus === 1 && selectedInvoiceInfo.is_return !== 1 && (
                                                <span className="px-3 py-1 text-xs font-semibold rounded bg-green-100 text-green-700 uppercase">
                                                    {selectedInvoiceInfo.status}
                                                </span>
                                            )}
                                            {selectedInvoiceInfo.is_return === 1 && (
                                                <span className="px-3 py-1 text-xs font-semibold rounded bg-red-100 text-red-700 uppercase">
                                                    Return
                                                </span>
                                            )}
                                            {selectedInvoiceInfo.docstatus === 0 && (
                                                <span className="px-3 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-700 uppercase">
                                                    Draft
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Customer Section */}
                                    <div className="pt-2 border-t border-border">
                                        <p className="text-xs text-muted-foreground mb-2">Customer</p>
                                        <p className="text-sm font-semibold text-foreground">{selectedInvoiceInfo.customer}</p>
                                        <p className="text-sm text-muted-foreground mt-0.5">{selectedInvoiceInfo.contact_mobile || selectedInvoiceInfo.mobile_no}</p>
                                        {selectedInvoiceInfo.contact_email && (
                                            <p className="text-sm text-muted-foreground mt-0.5">{selectedInvoiceInfo.contact_email}</p>
                                        )}
                                    </div>

                                    {/* Payment Details Section */}
                                    {selectedInvoiceInfo.payments && selectedInvoiceInfo.payments.length > 0 && (
                                        <div className="pt-2 border-t border-border">
                                            <p className="text-xs text-muted-foreground mb-2">Payment Details</p>
                                            {selectedInvoiceInfo.payments.map((payment: any, index: number) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm text-foreground">{payment.mode_of_payment}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>



                                {/* Items Label */}
                                <div className="shrink-0">
                                    <p className="text-xs text-muted-foreground mb-3">Items</p>
                                </div>
                            </div>

                            {/* Scrollable Items Section */}
                            <div className="flex-1 overflow-y-auto px-6">
                                <div className="border border-border rounded-lg p-4 space-y-4">
                                    {selectedInvoiceInfo.items?.map((item: any, index: number) => (
                                        <div key={item.name || index} className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-foreground">{item.item_name || item.item_code}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">{item.item_code}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    ₹{item.rate} × {Math.abs(item.qty)}
                                                </p>
                                            </div>
                                            <p className="text-sm font-semibold text-foreground">
                                                {formatCurrency(item.rate * Math.abs(item.qty))}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Fixed Totals Section */}
                            <div className="px-4 py-2 space-y-2 shrink-0">
                                <div className="space-y-2 p-2 bg-muted/10  rounded-lg">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Subtotal:</span>
                                        <span className="text-sm text-foreground">{formatCurrency(subtotal)}</span>
                                    </div>
                                    {tax > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Tax:</span>
                                            <span className="text-sm text-foreground">{formatCurrency(tax)}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between pt-2 border-t border-border">
                                        <span className="text-lg font-semibold text-foreground">Grand Total:</span>
                                        <span className="text-lg font-bold text-primary">{formatCurrency(selectedInvoiceInfo.grand_total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="px-6 py-4 border-t border-border flex gap-3 shrink-0">
                            <button
                                onClick={onBack}
                                className="flex-1 px-4 py-2.5 bg-background border border-input rounded-md text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                                Back to List
                            </button>
                            <button
                                onClick={() => onOpenChange(false)}
                                className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
