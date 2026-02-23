import { Input } from "@/components/ui/input"
import { FileText, Loader2, Search } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface CreditNoteInvoiceListProps {
    invoices: any[]
    loading: boolean
    loadingMore: boolean
    searchVal: string
    setSearchVal: (val: string) => void
    handleScroll: (e: React.UIEvent<HTMLDivElement>) => void
    onSelectInvoice: (invoice: any) => void
}

export function CreditNoteInvoiceList({
    invoices,
    loading,
    loadingMore,
    searchVal,
    setSearchVal,
    handleScroll,
    onSelectInvoice
}: CreditNoteInvoiceListProps) {
    return (
        <div className="flex flex-col h-full overflow-hidden">
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
                                    onClick={() => onSelectInvoice(inv)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-semibold text-foreground text-md">
                                                {inv.name}
                                            </span>
                                            {inv.is_return === 1 && (
                                                <span className="px-1.5 py-0.5 text-xs font-bold bg-red-100 text-red-600 rounded uppercase">
                                                    Return
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-1">
                                            <span className="block font-bold text-emerald-500 text-base">
                                                {formatCurrency(inv.grand_total)}
                                            </span>
                                            {inv.total_taxes_and_charges > 0 && (
                                                <span className="text-xs text-muted-foreground">
                                                    Tax: {formatCurrency(inv.total_taxes_and_charges)}
                                                </span>
                                            )}
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
        </div>
    )
}
