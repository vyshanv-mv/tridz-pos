import { Button } from "@/components/ui/button"
import type { Item } from "@/types/item"
import { useCartStore } from "@/store/cartStore"
import { usePosStore } from "@/store/posStore"
import { Plus, Info, CircleCheck } from "lucide-react"
import { useState } from "react"
import { ItemInfoDialog } from "./ItemInfoDialog"
import { useToast } from "@/hooks/use-toast"

interface ItemCardProps {
  item: Item
}

export function ItemCard({ item }: ItemCardProps) {
  const addItem = useCartStore(state => state.addItem)
  const showItemImages = usePosStore(state => state.showItemImages)
  const [showInfoDialog, setShowInfoDialog] = useState(false)
  const { toast } = useToast()

  const handleAddToCart = () => {
    addItem({
      item_code: item.item_code,
      item_name: item.item_name,
      rate: item.standard_rate ?? 0,
    })
    toast({
      description: (
        <div className="flex items-center gap-2">
          <CircleCheck className="h-4 w-4 text-green-600" />
          <span>{item.item_name} has been added to cart.</span>
        </div>
      ),
      duration: 1000,
    })
  }

  const stockQty = item.actual_qty ?? 0
  const stockColor = stockQty > 0 ? "text-green-600" : "text-red-500"

  return (
    <>
      <div
        className="bg-card rounded-lg overflow-hidden border border-border hover:shadow-md transition-all flex flex-col group cursor-pointer"
        onClick={handleAddToCart}
      >
        {/* Image Container - Fixed Aspect Ratio */}
        {showItemImages && (
          <div className="relative aspect-square w-full bg-muted overflow-hidden">
            {item.image ? (
              <img
                src={item.image}
                alt={item.item_name}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                No Image
              </div>
            )}
          </div>
        )}

        <div className="p-3 md:p-4 flex flex-col gap-1 md:gap-2 flex-1">
          <h3 className="font-medium text-sm md:text-base text-foreground line-clamp-2 min-h-[2.5rem] leading-tight">
            {item.item_name}
          </h3>

          <p className="text-sm md:text-xs text-muted-foreground uppercase tracking-[0.2em] font-medium">
            {item.item_code}
          </p>

          <div className="flex items-center justify-between mt-auto pt-2 md:pt-4">
            <div>
              <span className="text-lg md:text-xl font-bold text-primary">
                ₹{Math.floor(item.standard_rate ?? 0)}
              </span>
              <div className={`text-sm md:text-xs font-semibold mt-0.5 ${stockColor}`}>
                Stock: {stockQty}
              </div>
            </div>

            <div className="flex flex-col gap-2 items-center">
              <button
                type="button"
                className="cursor-pointer p-1 rounded-full hover:bg-muted transition-colors z-10"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowInfoDialog(true)
                }}
              >
                <Info
                  className="h-5 w-5 md:h-4 md:w-4 text-muted-foreground hover:text-primary transition-colors"
                />
              </button>
              <Button
                size="icon"
                className="h-10 w-10 md:h-10 md:w-10 rounded-full bg-primary hover:bg-accent shadow-md transition-all active:scale-90"
                onClick={(e) => {
                  e.stopPropagation()
                  handleAddToCart()
                }}
              >
                <Plus className="h-5 w-5 md:h-5 md:w-5 text-primary-foreground" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ItemInfoDialog
        item={item}
        open={showInfoDialog}
        onOpenChange={setShowInfoDialog}
      />
    </>
  )
}
