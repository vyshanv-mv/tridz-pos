import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, FileText } from "lucide-react"
import { buildTaxRows } from "@/lib/utils"

interface LastInvoiceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    invoice: any
    formatCurrency: (amount: number, currency?: string) => string
}

export function LastInvoiceDialog({ open, onOpenChange, invoice, formatCurrency }: LastInvoiceDialogProps) {
    if (!invoice) return null

    // Calculate subtotal from items
    const subtotal = invoice.items?.reduce((sum: number, item: any) => sum + (item.rate * Math.abs(item.qty)), 0) || 0
    const taxRows = buildTaxRows(invoice.taxes, 1, invoice.total_taxes_and_charges)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl md:max-w-2xl w-full sm:w-[95%] p-0 gap-0 bg-card rounded-lg shadow-lg flex flex-col overflow-hidden max-h-[90vh] z-[9999]">

                {/* Header */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-border bg-card">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-bold text-foreground">Last Invoice</DialogTitle>
                            <p className="text-sm text-muted-foreground">Invoice #{invoice.name}</p>
                        </div>
                    </div>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Invoice Meta Info */}
                    <div className="bg-muted/30 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Invoice Number</p>
                            <p className="text-sm font-medium text-foreground">{invoice.name}</p>
                        </div>
                        <div className="text-left sm:text-right">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Date</p>
                            <p className="text-sm font-medium text-foreground">
                                {invoice.posting_date}, {invoice.posting_time?.substring(0, 8)}
                            </p>
                        </div>
                        <div className="sm:col-span-2 border-t border-border/50 pt-3 mt-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Customer</p>
                            <p className="text-base font-medium text-foreground">{invoice.customer}</p>
                            {invoice.contact_mobile && (
                                <p className="text-sm text-muted-foreground">{invoice.contact_mobile}</p>
                            )}
                        </div>
                    </div>

                    {/* Items List */}
                    <div>
                        <h3 className="text-base font-semibold text-foreground mb-3">Items</h3>
                        <div className="space-y-3">
                            {invoice.items?.map((item: any, index: number) => (
                                <div key={index} className="flex justify-between items-start py-3 border-b border-border/50 last:border-0 last:pb-0">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-foreground">{item.item_name || item.item_code}</p>
                                        <p className="text-xs text-muted-foreground font-mono">{item.item_code}</p>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {formatCurrency(item.rate, invoice.currency)} × {Math.abs(item.qty)}
                                        </div>
                                    </div>
                                    <span className="text-sm font-semibold text-foreground min-w-20 text-right">
                                        {formatCurrency(item.rate * Math.abs(item.qty), invoice.currency)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Totals Summary */}
                    <div className="bg-muted/10 p-4 rounded-xl space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal:</span>
                            <span className="font-medium text-foreground">{formatCurrency(subtotal, invoice.currency)}</span>
                        </div>
                        {taxRows.map((tax, i) => (
                            <div key={i} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    {tax.label}{tax.rate > 0 ? ` (${tax.rate}%)` : ""}:
                                </span>
                                <span className="font-medium text-foreground">{formatCurrency(tax.amount, invoice.currency)}</span>
                            </div>
                        ))}
                        <div className="flex justify-between items-center pt-3 border-t border-border mt-2">
                            <span className="text-lg font-semibold text-foreground">Grand Total:</span>
                            <span className="text-xl font-bold text-foreground">{formatCurrency(invoice.grand_total, invoice.currency)}</span>
                        </div>
                    </div>

                    {/* Success Badge */}
                    <div className="flex justify-center pt-2">
                        <div className="inline-flex items-center gap-2 px-6 py-2 bg-green-100 text-green-700 rounded-full font-semibold text-sm shadow-sm ring-1 ring-green-200">
                            <Check className="h-4 w-4 stroke-[3]" />
                            <span>Paid</span>
                        </div>
                    </div>

                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-border bg-muted/10">
                    <Button onClick={() => onOpenChange(false)} className="w-full h-12 text-base font-semibold rounded-xl bg-primary hover:bg-primary/90 shadow-md transition-all">
                        Close
                    </Button>
                </div>

            </DialogContent>
        </Dialog>
    )
}
