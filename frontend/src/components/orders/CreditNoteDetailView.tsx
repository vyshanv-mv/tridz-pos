import { Dialog, DialogContent } from "@/components/ui/dialog"
import { CreditCard, Loader2, Minus, Plus } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { formatCurrency } from "@/lib/utils"

export interface ItemSelection {
    selected: boolean
    qty: number
    maxQty: number
}

interface CreditNoteDetailViewProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    loadingDetails: boolean
    selectedInvoiceInfo: any
    selectedItems: Record<string, ItemSelection>
    onSelectAll: () => void
    onClearAll: () => void
    onToggleItemSelection: (itemName: string) => void
    onUpdateItemQty: (itemName: string, delta: number) => void
    onBack: () => void
    onIssueCreditNote: () => void
    getSelectedItemsCount: () => number
    getTotalItems: () => number
    getTotalCreditAmount: () => number
}

export function CreditNoteDetailView({
    open,
    onOpenChange,
    loadingDetails,
    selectedInvoiceInfo,
    selectedItems,
    onSelectAll,
    onClearAll,
    onToggleItemSelection,
    onUpdateItemQty,
    onBack,
    onIssueCreditNote,
    getSelectedItemsCount,
    getTotalItems,
    getTotalCreditAmount
}: CreditNoteDetailViewProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl w-[calc(100%-2rem)] h-[90vh] sm:h-[90vh] sm:max-h-[90vh] p-0 gap-0 bg-card rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col">
                {loadingDetails ? (
                    <div className="flex-1 flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-800" />
                    </div>
                ) : (
                    <>
                        {/* Header - Fixed */}
                        <div className="px-4 py-4 shrink-0 flex items-start justify-between border-b border-border">
                            <div>
                                <h2 className="text-xl font-semibold text-foreground">Issue Credit Note</h2>
                                <p className="text-sm text-muted-foreground mt-1">Select items and quantities for credit note</p>
                            </div>
                        </div>


                        {/* Scrollable Content Area */}
                        <div className="flex-1 overflow-y-auto scrollbar-thin pb-4">
                            <div className="px-4 py-4 space-y-4">
                                {/* Invoice Information Card */}
                                <div className="bg-muted/10 border border-border rounded-xl p-4">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-2 sm:gap-0">
                                        <div>
                                            <h3 className="text-sm sm:text-base font-semibold text-foreground">{selectedInvoiceInfo.name}</h3>
                                            <p className="text-xs sm:text-sm font-medium text-foreground mt-1">{selectedInvoiceInfo.customer}</p>
                                            <p className="text-xs sm:text-sm text-muted-foreground">{selectedInvoiceInfo.contact_mobile || selectedInvoiceInfo.mobile_no}</p>
                                        </div>
                                        <div className="self-end sm:self-auto">
                                            <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-green-100 text-green-800 text-sm sm:text-xs font-semibold rounded-full uppercase">
                                                {selectedInvoiceInfo.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border-t border-border pt-3 mt-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm sm:text-base font-medium text-muted-foreground">Invoice Total:</span>
                                            <span className="text-base sm:text-lg font-semibold text-foreground">{formatCurrency(selectedInvoiceInfo.grand_total)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Select Items Section Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm lg:text-base font-semibold text-foreground">Select Items for Credit Note</h4>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={onSelectAll}
                                            className="px-3.5 py-2 border border-input rounded-lg text-xs lg:text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                                        >
                                            Select All
                                        </button>
                                        <button
                                            onClick={onClearAll}
                                            className="px-3.5 py-2 border border-input rounded-lg text-xs lg:text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>

                                {/* Items List */}
                                <div className="">
                                    {selectedInvoiceInfo.items?.map((item: any) => {
                                        const itemState = selectedItems[item.name]
                                        if (!itemState) return null

                                        return (
                                            <div
                                                key={item.name}
                                                className={`rounded-lg p-4 mb-2 border transition-all ${itemState.selected
                                                    // If selected, keep primary border but maybe allow hover black? Let's follow user "border black on hover".
                                                    ? 'bg-secondary/25 border-primary hover:border-black'
                                                    // Non-selected: transparent border, bottom border, hover black
                                                    : 'bg-card border-transparent border-b-border hover:border-black last:border-b-transparent'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <Checkbox
                                                        checked={itemState.selected}
                                                        onCheckedChange={() => onToggleItemSelection(item.name)}
                                                        className="mt-0.5"
                                                    />
                                                    <div className="flex-1">
                                                        <h5 className="text-sm lg:text-base font-semibold text-foreground">
                                                            {item.item_name || item.item_code}
                                                        </h5>
                                                        <p className="text-[13px] text-muted-foreground">{item.item_code}</p>
                                                        <p className="text-sm text-foreground mt-1">
                                                            ₹{item.rate} × {itemState.maxQty} = {formatCurrency(item.rate * itemState.maxQty)}
                                                        </p>

                                                        {/* Quantity Controls */}
                                                        <div className="flex items-center gap-2 mt-3">
                                                            <span className="text-xs lg:text-sm text-foreground font-medium">Credit Qty:</span>
                                                            <button
                                                                onClick={() => onUpdateItemQty(item.name, -1)}
                                                                disabled={!itemState.selected || itemState.qty <= 1}
                                                                className="w-9 h-9 flex items-center justify-center bg-card border border-input rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                            >
                                                                <Minus className="h-4 w-4 text-muted-foreground" />
                                                            </button>
                                                            <span className="min-w-8 text-center text-xs lg:text-sm font-semibold text-foreground">
                                                                {itemState.qty}
                                                            </span>
                                                            <button
                                                                onClick={() => onUpdateItemQty(item.name, 1)}
                                                                disabled={!itemState.selected || itemState.qty >= itemState.maxQty}
                                                                className="lg:w-9 lg:h-9 w-6 h-6 flex items-center justify-center bg-card border border-input rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                            >
                                                                <Plus className="h-4 w-4 text-muted-foreground" />
                                                            </button>
                                                            <span className="text-xs lg:text-sm text-muted-foreground">/ {itemState.maxQty}</span>
                                                            <span className="text-sm font-semibold text-foreground ml-auto">
                                                                {formatCurrency(item.rate * itemState.qty)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>


                                {/* Credit Note Summary */}
                                <div className="mt-4">
                                    <div className="bg-secondary/20 border border-primary rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                                            <h5 className="text-base font-semibold text-foreground">Credit Note Summary</h5>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-muted-foreground">Selected items:</span>
                                                <span className="text-sm font-medium text-foreground">
                                                    {getSelectedItemsCount()} of {getTotalItems()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-muted-foreground">Credit amount:</span>
                                                <span className="text-lg font-bold text-foreground">
                                                    {formatCurrency(getTotalCreditAmount())}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Buttons - Fixed */}
                        <div className="px-4 py-4 border-t border-border flex gap-3 shrink-0">
                            <button
                                onClick={onBack}
                                className="flex-1 px-4 py-2.5 bg-background border border-input rounded-md text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={onIssueCreditNote}
                                disabled={!!selectedInvoiceInfo.hasReturn || getSelectedItemsCount() === 0}
                                className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                            >
                                Issue Credit Note
                            </button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog >
    )
}
