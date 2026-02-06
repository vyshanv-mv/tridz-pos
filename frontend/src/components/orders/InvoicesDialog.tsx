import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { FileText, Loader2, Search } from "lucide-react"
import { InvoiceDetailView } from "./InvoiceDetailView"
import { useEffect, useState } from "react"
import { getAllInvoices, getInvoice } from "@/api/invoice"
import { formatCurrency } from "@/lib/utils"

interface InvoicesDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function InvoicesDialog({ open, onOpenChange }: InvoicesDialogProps) {
    const [invoices, setInvoices] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedInvoiceInfo, setSelectedInvoiceInfo] = useState<any>(null)
    const [loadingDetails, setLoadingDetails] = useState(false)
    const [searchVal, setSearchVal] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")

    // Infinite scroll state
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
        }
    }, [open, debouncedSearch])

    const loadInvoices = async (pageNum: number, search: string) => {
        if (pageNum === 1) {
            setLoading(true)
        } else {
            setLoadingMore(true)
        }

        try {
            const data = await getAllInvoices(pageNum, 5, search)


            if (pageNum === 1) {
                setInvoices(data.invoices)
            } else {
                setInvoices(prev => [...prev, ...data.invoices])
            }

            setHasMore(data.currentPage < data.totalPages)
            setPage(pageNum)
        } catch (error) {
            console.error("Failed to load invoices", error)
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
            setSelectedInvoiceInfo(data)
        } catch (error) {
            console.error("Failed to load invoice details", error)
        } finally {
            setLoadingDetails(false)
        }
    }

    // Helper function to get status badge styling
    const getStatusBadge = (inv: any) => {
        if (inv.is_return === 1) {
            return {
                text: 'Return',
                className: 'bg-red-100 text-red-600'
            }
        }
        if (inv.docstatus === 0) {
            return {
                text: 'Draft',
                className: 'bg-yellow-100 text-yellow-700'
            }
        }
        return {
            text: inv.status,
            className: ' text-green-500'
        }
    }

    // Detail view with redesigned UI (same as credit note)
    if (selectedInvoiceInfo || loadingDetails) {
        return (
            <InvoiceDetailView
                open={open}
                onOpenChange={onOpenChange}
                loadingDetails={loadingDetails}
                selectedInvoiceInfo={selectedInvoiceInfo}
                onBack={() => setSelectedInvoiceInfo(null)}
                formatCurrency={formatCurrency}
            />
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl md:max-w-3xl w-[calc(100%-2rem)] p-4 sm:p-0 gap-0 bg-card h-[85vh] max-h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
                <div className="px-2 py-4 sm:p-4 bg-card shrink-0 border-b border-border space-y-4">
                    <div>
                        <h2 className="text-lg font-bold">Invoices</h2>
                        <p className="text-sm text-muted-foreground">View all invoices and their details</p>
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
                        <div className="h-full border border-border rounded-lg overflow-hidden flex flex-col">
                            {/* Inner Scrollable List */}
                            <div
                                className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-2 space-y-3"
                                onScroll={handleScroll}
                            >
                                {invoices.map((inv) => {
                                    const statusBadge = getStatusBadge(inv)
                                    return (
                                        <div
                                            key={inv.name}
                                            className="bg-card p-3 rounded-lg border border-border hover:border-foreground cursor-pointer transition-all"
                                            onClick={() => handleSelectInvoice(inv)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-semibold text-foreground text-md">
                                                        {inv.name}
                                                    </span>
                                                </div>
                                                <div className="text-right flex flex-col items-end gap-1">
                                                    <span className="block font-bold text-emerald-500 text-base">
                                                        {formatCurrency(inv.grand_total)}
                                                    </span>
                                                    <span className={`text-sm font-bold text-emerald-500 uppercase tracking-wider px-1.5 py-0.5 rounded w-fit ${statusBadge.className}`}>
                                                        {statusBadge.text}
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
                                    )
                                })}

                                {loadingMore && (
                                    <div className="flex justify-center py-4">
                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                    </div>
                                )}

                                {!loading && invoices.length === 0 && (
                                    <div className="text-center py-10 text-muted-foreground text-sm">
                                        {searchVal ? "No invoices match your search" : "No invoices found"}
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
