import { useState } from "react"
import { useCheckout } from "@/hooks/useCheckout"
import { CartSummary } from "./CartSummary"
import { Button } from "@/components/ui/button"
import { useCartStore, selectActiveItems, selectGrandTotal } from "@/store/cartStore"
import { usePosStore } from "@/store/posStore"
import { CartItem } from "./CartItem"
import { PaymentDialog } from "./PaymentDialog"
import { useToast } from "@/hooks/use-toast"
import { CircleCheck } from "lucide-react"

import { OrderTabs } from "./OrderTabs"
import type { Customer } from "@/types/customer"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function CartPanel() {
  const { addItem, removeItem, reduceItem } = useCartStore()
  const { profile } = usePosStore()
  const items = useCartStore(selectActiveItems)
  const grandTotal = useCartStore((state) => selectGrandTotal(state, profile))
  const { toast } = useToast()
  const { processPayment } = useCheckout()

  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [itemToRemove, setItemToRemove] = useState<string | null>(null)

  const confirmRemoval = () => {
    if (itemToRemove) {
      removeItem(itemToRemove)
      toast({
        description: (
          <div className="flex items-center gap-2">
            <CircleCheck className="h-4 w-4 text-green-600" />
            <span>Successfully removed from cart</span>
          </div>
        ),
      })
      setItemToRemove(null)
    }
  }



  const totalItems = items.reduce((sum, item) => sum + item.qty, 0)

  const handleCheckout = () => {
    if (items.length === 0) return
    setIsPaymentOpen(true)
  }

  const handlePaymentConfirm = async (payments: any[], customer?: Customer) => {
    const success = await processPayment(payments, customer)
    if (success) {
      setIsPaymentOpen(false)
    }
  }

  return (
    <div className="w-full h-full border-l flex flex-col bg-background shadow-sm">
      <OrderTabs />

      <div className="flex flex-col flex-1 p-2 overflow-hidden">
        <div className="mb-4 flex-shrink-0">
          <h2 className="text-xl font-semibold text-foreground">
            Current Order
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {totalItems} items
          </p>
        </div>

        <div className="flex-1 overflow-y-auto -mx-2 px-2 min-h-0">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm">
              <p className="text-lg">Cart is empty</p>
              <p className="text-sm mt-1">Add items to get started</p>
            </div>
          ) : (
            <div className="space-y-1 pb-2">
              {items.map((item) => (
                <CartItem
                  key={item.item_code}
                  {...item}
                  onAdd={() => addItem({
                    item_code: item.item_code,
                    item_name: item.item_name,
                    rate: item.rate
                  })}
                  onReduce={() => reduceItem(item.item_code)}
                  onRemove={() => setItemToRemove(item.item_code)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 mt-2">
          <CartSummary />

          <Button
            className="w-full mt-4 h-12 text-base font-medium bg-primary hover:bg-accent text-primary-foreground shadow-none rounded-md"
            size="lg"
            disabled={items.length === 0}
            onClick={handleCheckout}
          >
            Checkout
          </Button>
        </div>
      </div>

      <PaymentDialog
        open={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
        total={grandTotal}
        onConfirm={handlePaymentConfirm}
      />


      <AlertDialog open={!!itemToRemove} onOpenChange={(open: boolean) => !open && setItemToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Item?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this item from the cart?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={confirmRemoval}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
