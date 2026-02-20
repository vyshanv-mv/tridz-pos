import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { FileText, Loader2, Search } from "lucide-react"
import { CreditNoteDetailView, type ItemSelection } from "./CreditNoteDetailView"
import { useEffect, useState } from "react"
import { getPaidInvoices, getInvoice, createDraftPOSInvoice } from "@/api/invoice"
import { checkIfInvoiceHasReturn } from "@/api/returnCheck"
import { formatCurrency } from "@/lib/utils"
import { usePosStore } from "@/store/posStore"
import { useToast } from "@/hooks/use-toast"

interface CreditNoteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreditNoteDialog({ open, onOpenChange }: CreditNoteDialogProps) {
    const [invoices, setInvoices] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedInvoiceInfo, setSelectedInvoiceInfo] = useState<any>(null)
    const [loadingDetails, setLoadingDetails] = useState(false)
    const [selectedItems, setSelectedItems] = useState<Record<string, ItemSelection>>({})
    const [searchVal, setSearchVal] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const { toast } = useToast()

    // Pagination state
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchVal)
        }, 500)
        return () => clearTimeout(timer)
    }, [searchVal])

    useEffect(() => {
        if (open) {
            setPage(1)
            setInvoices([])
            setHasMore(true)
            loadInvoices(1, debouncedSearch)
            setSelectedInvoiceInfo(null)
            setSelectedItems({})
        }
    }, [open, debouncedSearch])

    useEffect(() => {
        if (selectedInvoiceInfo?.items) {
            const initialItems: Record<string, ItemSelection> = {}
            selectedInvoiceInfo.items.forEach((item: any) => {
                initialItems[item.name] = {
                    selected: true,
                    qty: Math.abs(item.qty),
                    maxQty: Math.abs(item.qty)
                }
            })
            setSelectedItems(initialItems)
        }
    }, [selectedInvoiceInfo])

    const loadInvoices = async (pageNum: number, search: string) => {
        if (pageNum === 1) {
            setLoading(true)
        } else {
            setLoadingMore(true)
        }

        try {
            const data = await getPaidInvoices(pageNum, 5, search)

            if (pageNum === 1) {
                setInvoices(data.invoices)
            } else {
                setInvoices(prev => [...prev, ...data.invoices])
            }

            setHasMore(data.currentPage < data.totalPages)
            setPage(pageNum)
        } catch (error) {
            console.error("Failed to load invoices", error)
            toast({
                title: "Error",
                description: "Failed to load invoices",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget

        // Load more when scrolled to bottom (with some buffer)
        if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !loadingMore && !loading) {
            loadInvoices(page + 1, debouncedSearch)
        }
    }

    const handleSelectInvoice = async (invoice: any) => {
        setLoadingDetails(true)
        try {
            const data = await getInvoice(invoice.name)
            const returnName = await checkIfInvoiceHasReturn(invoice.name)
            setSelectedInvoiceInfo({ ...data, returnName })
        } catch (error) {
            console.error("Failed to load invoice details", error)
        } finally {
            setLoadingDetails(false)
        }
    }

    const toggleItemSelection = (itemName: string) => {
        setSelectedItems(prev => ({
            ...prev,
            [itemName]: { ...prev[itemName], selected: !prev[itemName].selected }
        }))
    }

    const updateItemQty = (itemName: string, delta: number) => {
        setSelectedItems(prev => {
            const current = prev[itemName]
            const newQty = Math.max(1, Math.min(current.maxQty, current.qty + delta))
            return {
                ...prev,
                [itemName]: { ...current, qty: newQty }
            }
        })
    }

    const selectAll = () => {
        setSelectedItems(prev => {
            const updated = { ...prev }
            Object.keys(updated).forEach(key => {
                updated[key] = { ...updated[key], selected: true }
            })
            return updated
        })
    }

    const clearAll = () => {
        setSelectedItems(prev => {
            const updated = { ...prev }
            Object.keys(updated).forEach(key => {
                updated[key] = { ...updated[key], selected: false }
            })
            return updated
        })
    }

    const getSelectedItemsCount = () => {
        return Object.values(selectedItems).filter(item => item.selected).length
    }

    const getTotalItems = () => {
        return Object.keys(selectedItems).length
    }

    const getEstimatedCreditAmount = () => {
        if (!selectedInvoiceInfo || !selectedInvoiceInfo.items) return { subtotal: 0, tax: 0, grandTotal: 0 }

        // Calculate total basis amount of original invoice (sum of rate * qty)
        const totalBasis = selectedInvoiceInfo.items.reduce((sum: number, item: any) => {
            return sum + (Math.abs(item.qty) * item.rate)
        }, 0)

        // Calculate basis amount of selected return items
        const selectedBasis = selectedInvoiceInfo.items.reduce((sum: number, item: any) => {
            const itemState = selectedItems[item.name]
            if (itemState?.selected) {
                return sum + (itemState.qty * item.rate)
            }
            return sum
        }, 0)

        if (totalBasis === 0) return { subtotal: 0, tax: 0, grandTotal: 0 }

        const ratio = selectedBasis / totalBasis

        // Original Totals (use net_total if available, or derive)
        // net_total is usually the sum of item amounts (subtotal)
        // total_taxes_and_charges is the tax amount
        const originalSubtotal = selectedInvoiceInfo.net_total || selectedInvoiceInfo.total || 0
        const originalTax = selectedInvoiceInfo.total_taxes_and_charges || 0
        const originalGrandTotal = selectedInvoiceInfo.grand_total || 0

        return {
            subtotal: ratio * originalSubtotal,
            tax: ratio * originalTax,
            grandTotal: ratio * originalGrandTotal
        }
    }



    const handleIssueCreditNote = async () => {
        if (!selectedInvoiceInfo) return

        if (selectedInvoiceInfo.returnName) {
            toast({
                description: "This invoice has already been returned.",
                variant: "destructive"
            })
            return
        }

        const selectedItemsList = selectedInvoiceInfo.items.filter((item: any) => selectedItems[item.name]?.selected)

        if (selectedItemsList.length === 0) {
            toast({
                description: "Please select at least one item to return.",
                variant: "destructive"
            })
            return
        }

        try {
            // Get POS profile and opening entry from store
            const { profile, openingEntry } = usePosStore.getState()

            if (!profile || !openingEntry) {
                toast({
                    title: "Error",
                    description: "POS profile or opening entry not found. Please reload the page.",
                    variant: "destructive"
                })
                return
            }

            // Prepare items with negative quantities for return
            const returnItems = selectedItemsList.map((item: any) => ({
                item_code: item.item_code,
                item_name: item.item_name || item.item_code,
                qty: -1 * selectedItems[item.name].qty, // Negative quantity for return
                rate: item.rate,
                pos_invoice_item: item.name // Link to original invoice item
            }))

            // ERPNext will calculate the totals for the return
            const creditNote = await createDraftPOSInvoice({
                customer: selectedInvoiceInfo.customer,
                company: profile.company,
                pos_profile: profile.name,
                pos_opening_entry: openingEntry.name,
                currency: profile.currency,
                warehouse: profile.warehouse,
                items: returnItems as any,
                // Send dummy payment to satisfy ERPNext validation for POS Invoice
                payments: [{ mode_of_payment: "Cash", amount: 0 }],
                taxes: selectedInvoiceInfo.taxes,
                taxes_and_charges: selectedInvoiceInfo.taxes_and_charges,
                return_against: selectedInvoiceInfo.name, // Link to original invoice
            })

            if (creditNote?.name) {
                // Formatting the currency check if possible, or just raw number
                const response = creditNote as any
                const refundAmount = response.grand_total ? Math.abs(response.grand_total) : 0

                toast({
                    title: "Success",
                    description: `Credit Note ${creditNote.name} created. Refund Amount: ${formatCurrency(refundAmount)}`,
                })

                onOpenChange(false)
                // Optionally refresh the invoice list
                loadInvoices(1, debouncedSearch)
            }
        } catch (error: any) {
            console.error("Failed to create credit note:", error)
            toast({
                title: "Error",
                description: error.message || "Failed to create credit note",
                variant: "destructive"
            })
        }
    }

    if (selectedInvoiceInfo || loadingDetails) {
        return (
            <CreditNoteDetailView
                open={open}
                onOpenChange={onOpenChange}
                loadingDetails={loadingDetails}
                selectedInvoiceInfo={selectedInvoiceInfo}
                selectedItems={selectedItems}
                onSelectAll={selectAll}
                onClearAll={clearAll}
                onToggleItemSelection={toggleItemSelection}
                onUpdateItemQty={updateItemQty}
                onBack={() => setSelectedInvoiceInfo(null)}
                onIssueCreditNote={handleIssueCreditNote}
                getSelectedItemsCount={getSelectedItemsCount}
                getTotalItems={getTotalItems}
                getEstimatedCreditAmount={getEstimatedCreditAmount}
            />
        )
    }


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl md:max-w-3xl w-[calc(100%-2rem)] p-0 gap-0 bg-card h-[85vh] max-h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
                <div className="px-2 py-4 sm:p-4 bg-card shrink-0 border-b border-border space-y-4">
                    <div>
                        <h2 className="text-lg font-bold">Issue Credit Note</h2>
                        <p className="text-sm text-muted-foreground">Select a paid invoice to issue credit note</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by customer, mobile, or status..."
                            value={searchVal}
                            onChange={(e) => setSearchVal(e.target.value)}
                            className="pl-8 bg-muted/20"
                        />
                    </div>
                </div>

                {/* Content Container - Fixed frame with internal scroll */}
                <div className="flex-1 min-h-0 overflow-hidden p-2">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="h-full overflow-hidden flex flex-col">
                            {/* Inner Scrollable List */}
                            <div
                                className="flex-1 min-h-0 overflow-y-auto scrollbar-thin"
                                onScroll={handleScroll}
                            >
                                {invoices.map((inv) => (
                                    <div
                                        key={inv.name}
                                        className="bg-card p-4 mb-2 rounded-xl border border-transparent border-b-border hover:border-black cursor-pointer transition-all last:border-b-transparent"
                                        onClick={() => handleSelectInvoice(inv)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-semibold text-foreground text-md">
                                                    {inv.name}
                                                </span>
                                                {inv.is_return === 1 && (
                                                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-600 rounded uppercase">
                                                        Return
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-right flex flex-col items-end gap-1">

                                                <span className="block font-bold text-emerald-500 text-base">
                                                    {formatCurrency(inv.grand_total)}
                                                </span>
                                                <span className="text-sm font-bold text-emerald-500 uppercase tracking-wider px-1.5 py-0.5 rounded w-fit">
                                                    {inv.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-sm text-muted-foreground">
                                            {inv.posting_date}, {inv.posting_time?.substring(0, 5)}
                                        </div>

                                        <div>
                                            <p className="text-lg font-medium text-foreground">{inv.customer}</p>
                                            {inv.contact_mobile && (
                                                <p className="text-sm text-muted-foreground">{inv.contact_mobile}</p>
                                            )}
                                        </div>

                                        {inv.total_qty && (
                                            <div className="mt-2 text-left">
                                                <p className="text-sm text-muted-foreground font-medium inline-block px-2 py-1 rounded">
                                                    {Math.floor(inv.total_qty)} item{Math.floor(inv.total_qty) !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {loadingMore && (
                                    <div className="flex justify-center py-4">
                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                    </div>
                                )}

                                {!loading && invoices.length === 0 && (
                                    <div className="text-center py-10 text-muted-foreground text-sm">
                                        {searchVal ? "No invoices match your search" : "No paid invoices found"}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
