import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Item } from "@/types/item"

interface ItemInfoDialogProps {
    item: Item
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ItemInfoDialog({ item, open, onOpenChange }: ItemInfoDialogProps) {
    const stockQty = item.actual_qty ?? 0

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[90vw] sm:max-w-[500px] p-0 gap-0 overflow-hidden rounded-lg">
                <DialogHeader className="px-6 pt-6 pb-4 relative">
                    <DialogTitle className="text-xl font-semibold text-foreground">
                        Stock Information
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        View detailed stock information for the selected item.
                    </p>
                </DialogHeader>

                <div className="px-6 pb-6 space-y-6">
                    {/* Item Name and Code */}
                    <div>
                        <h3 className="text-2xl font-semibold text-foreground mb-1">
                            {item.item_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {item.item_code}
                        </p>
                    </div>

                    {/* Information Grid */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-border">
                            <span className="text-base text-muted-foreground">Category:</span>
                            <span className="text-base font-medium text-foreground">
                                {item.item_group || "N/A"}
                            </span>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-border">
                            <span className="text-base text-muted-foreground">Price:</span>
                            <span className="text-base font-medium text-foreground">
                                ₹{Math.floor(item.standard_rate ?? 0)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-border">
                            <span className="text-base text-muted-foreground">Stock Quantity:</span>
                            <span className={`text-base font-semibold ${stockQty > 0 ? 'text-primary' : 'text-destructive'}`}>
                                {stockQty} units
                            </span>
                        </div>
                    </div>

                    {/* Close Button */}
                    <Button
                        onClick={() => onOpenChange(false)}
                        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg"
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
