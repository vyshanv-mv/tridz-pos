
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { SalesReportsDashboard } from "./SalesReportsDashboard"

interface ReportsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ReportsDialog({ open, onOpenChange }: ReportsDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-full h-full overflow-y-auto scrollbar-thin">
                <SalesReportsDashboard />
            </DialogContent>
        </Dialog>
    )
}
