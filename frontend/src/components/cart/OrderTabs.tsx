import { Plus, X } from "lucide-react"
import { useCartStore } from "@/store/cartStore"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export function OrderTabs() {
    const { orders, activeOrderId, newOrder, selectOrder, closeOrder } = useCartStore()
    const { toast } = useToast()

    return (
        <div className="flex gap-2 border-b p-3 bg-muted/20 overflow-x-auto scrollbar-hide">
            {orders.map((order) => {
                const isActive = order.id === activeOrderId
                return (
                    <div
                        key={order.id}
                        onClick={() => selectOrder(order.id)}
                        className={cn(
                            "px-3 py-4 border-t border-x rounded-t-lg text-sm font-medium border-b-0 -mb-[1px] cursor-pointer flex items-center gap-2 group min-w-[120px] justify-between transition-colors",
                            isActive
                                ? "bg-background text-primary border-primary z-10"
                                : "bg-muted/10 text-muted-foreground border-transparent hover:bg-muted/30"
                        )}
                    >
                        <span>Order #{order.id}</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                closeOrder(order.id)
                            }}
                            className={cn(
                                "h-5 w-5 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors text-muted-foreground hover:text-foreground",
                                orders.length === 1
                            )}
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                )
            })}

            <button
                className="px-3 py-1 text-sm font-medium bg-primary text-primary-foreground border border-primary rounded-md hover:bg-accent flex items-center gap-1 min-w-fit shadow-sm h-9 my-auto"
                onClick={() => {
                    newOrder()
                    toast({
                        title: "New order started",
                        duration: 1500,
                    })
                }}
                data-id="new-order-btn"
            >
                <Plus className="h-4 w-4" />
                New Order
            </button>
        </div >
    )
}
