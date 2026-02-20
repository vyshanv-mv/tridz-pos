import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUserStore } from "@/store/userStore"
import { BarChart3, Dock, LogOut, Receipt, User } from "lucide-react"
import { useState } from "react"
import { CreditNoteDialog } from "@/components/orders/CreditNoteDialog"
import { InvoicesDialog } from "@/components/orders/InvoicesDialog"

import { ReportsDialog } from "@/components/reports/ReportsDialog"
import { LastInvoiceDialog } from "@/components/orders/LastInvoiceDialog"
import { getAllInvoices, getInvoice } from "@/api/invoice"
import { formatCurrency } from "@/lib/utils"
import { FileSearch } from "lucide-react"

export function UserProfile() {
    const { currentUser, logout } = useUserStore()
    const [showCreditNote, setShowCreditNote] = useState(false)
    const [showInvoices, setShowInvoices] = useState(false)
    const [showReports, setShowReports] = useState(false)
    const [showLastInvoice, setShowLastInvoice] = useState(false)
    const [lastInvoice, setLastInvoice] = useState<any>(null)

    const handleLastInvoiceClick = async () => {
        try {
            // Fetch the most recent invoice (page 1, limit 1)
            const result = await getAllInvoices(1, 1)
            if (result.invoices && result.invoices.length > 0) {
                // Fetch full details including items
                const fullInvoice = await getInvoice(result.invoices[0].name)
                setLastInvoice(fullInvoice)
                setShowLastInvoice(true)
            } else {
                alert("No invoices found")
            }
        } catch (error) {
            console.error("Failed to fetch last invoice", error)
        }
    }

    // Fallback for user name if not loaded or available
    const userName = currentUser?.full_name || currentUser?.name || "Guest User"
    const userRole = currentUser?.roles?.[0]?.role || "POS User"

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="focus:outline-none w-11 h-11 rounded-full hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors group">
                        <User className="h-6 w-6 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{userName}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {userRole}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setShowReports(true)}
                    >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span>Report</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setShowInvoices(true)}
                    >
                        <Dock className="mr-2 h-4 w-4" />
                        <span>Invoices</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={handleLastInvoiceClick}
                    >
                        <FileSearch className="mr-2 h-4 w-4" />
                        <span>Last Invoice</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setShowCreditNote(true)}
                    >
                        <Receipt className="mr-2 h-4 w-4" />
                        <span>Issue Credit Note</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50" onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <CreditNoteDialog
                open={showCreditNote}
                onOpenChange={setShowCreditNote}
            />

            <InvoicesDialog
                open={showInvoices}
                onOpenChange={setShowInvoices}
            />

            <ReportsDialog
                open={showReports}
                onOpenChange={setShowReports}
            />

            <LastInvoiceDialog
                open={showLastInvoice}
                onOpenChange={setShowLastInvoice}
                invoice={lastInvoice}
                formatCurrency={formatCurrency}
            />
        </>
    )
}
