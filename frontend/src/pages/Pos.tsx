import { useState, useEffect } from "react"

import { TopBar } from "@/components/layout/TopBar"
import { CategoryBar } from "@/components/layout/CategoryBar"
import { ItemGrid } from "@/components/items/ItemGrid"
import { CartPanel } from "@/components/cart/CartPanel"
import { usePosStore } from "@/store/posStore"
import { useItemsStore } from "@/store/itemsStore"
import { useUserStore } from "@/store/userStore"
import { OpeningEntryError } from "@/components/layout/OpeningEntryError"
import { NoPosProfileError } from "@/components/layout/NoPosProfileError"
import { Button } from "@/components/ui/button"
import { PaymentDialog } from "@/components/cart/PaymentDialog"
import { useCartStore, selectActiveItems, selectGrandTotal } from "@/store/cartStore"
import type { Customer } from "@/types/customer"
import { useCheckout } from "@/hooks/useCheckout"
import { AlertCircle, ShoppingBag } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

import { LastInvoiceDialog } from "@/components/orders/LastInvoiceDialog"
import { formatCurrency } from "@/lib/utils"

export default function Pos() {
  const { loadProfile, profile, loading: posLoading, error: posError } = usePosStore()
  const { fetchItems, fetchCategories, loading: itemsLoading, error: itemsError } = useItemsStore()
  const { initSession } = useUserStore()
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  // Last Invoice Dialog State
  const [lastInvoice, setLastInvoice] = useState<any>(null)
  const [showLastInvoiceDialog, setShowLastInvoiceDialog] = useState(false)

  const activeItems = useCartStore(selectActiveItems)
  const grandTotal = useCartStore((state) => selectGrandTotal(state, profile))

  const { processPayment } = useCheckout()
  // const { newOrder } = useCartStore() // Removed unused
  // const { toast } = useToast() // Removed unused

  // Initialize POS and user session
  useEffect(() => {
    const initialize = async () => {
      try {
        await loadProfile()
      } catch (error) {
        console.error("POS initialization failed:", error)
      }
    }
    initialize()
  }, [loadProfile, initSession])

  // Load items and categories after profile is loaded
  useEffect(() => {
    const loadData = async () => {
      if (profile?.selling_price_list) {
        try {
          await Promise.all([
            fetchItems(profile.selling_price_list),
            fetchCategories(),
          ])
        } catch (error) {
          console.error("Failed to load items:", error)
        }
      }
    }
    loadData()
    loadData()
  }, [profile, fetchItems, fetchCategories])

  // Close sheet on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setIsSheetOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Common handler for successful payment
  const handlePaymentSuccess = (invoice: any) => {
    setLastInvoice(invoice)
    // Small timeout to ensure dialog state updates cleanly
    setTimeout(() => {
      setShowLastInvoiceDialog(true)
    }, 100)
  }

  // Handle mobile payment confirmation
  const handleMobilePaymentConfirm = async (payments: any[], customer?: Customer) => {
    const invoice = await processPayment(payments, customer)
    if (invoice) {
      setIsPaymentOpen(false)
      handlePaymentSuccess(invoice)
    }
  }

  // Error handling - POS Opening Entry
  if (posError && posError.includes("POS Opening Entry not found")) {
    return <OpeningEntryError error={posError} />
  }

  // Error handling - No POS Profile
  if (posError && posError.includes("No POS Profile found for user")) {
    return <NoPosProfileError error={posError} />
  }

  const totalItemsCount = activeItems.reduce((sum, item) => sum + item.qty, 0)


  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top Navigation Bar */}
      <TopBar />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Side: Categories & Items Grid */}
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          {/* Category Filter Bar */}
          <CategoryBar />

          {/* Items Grid Container */}
          <div className="flex-1 overflow-y-auto bg-background pb-20 xl:pb-4">
            {/* Error Display */}
            {(posError || itemsError) && (
              <div className="mx-3 sm:mx-4 md:mx-6 mt-4 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm sm:text-base">Error occurred</p>
                  <p className="text-xs sm:text-sm mt-1">{posError || itemsError}</p>
                </div>
              </div>
            )}

            {/* Loading Display */}
            {(posLoading || itemsLoading) && (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-3" />
                  <p className="text-sm sm:text-base text-muted-foreground">Loading POS data...</p>
                </div>
              </div>
            )}

            {/* Items Grid */}
            {!posLoading && !itemsLoading && <ItemGrid />}
          </div>
        </div>

        {/* Right Side: Cart Panel - Desktop Only */}
        <aside className="hidden xl:flex xl:w-[450px] shrink-0 bg-card border-l shadow-sm">
          <CartPanel onPaymentSuccess={handlePaymentSuccess} />
        </aside>
      </div>

      {/* Mobile-only Fixed Checkout Bar (< xl) - Original Style */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t p-1 safe-area-bottom">
        <Button
          onClick={() => setIsPaymentOpen(true)}
          disabled={activeItems.length === 0}
          className="w-full h-12 bg-primary hover:bg-accent text-primary-foreground rounded-xl font-bold text-md flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-50"
        >
          <span>Checkout ({totalItemsCount} items)</span>
          <span className="opacity-60 mx-1">•</span>
          <span>₹{grandTotal.toFixed(2)}</span>
        </Button>
      </div>

      {/* Mobile-only Cart/Order Drawer */}
      <div className="xl:hidden fixed bottom-20 right-4 z-50">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button
              className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-accent text-primary-foreground flex items-center justify-center p-0"
            >
              <ShoppingBag className="h-8 w-8" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 border-l w-[90%] sm:max-w-[420px]">
            <CartPanel onPaymentSuccess={handlePaymentSuccess} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Payment Dialog Modal */}
      <PaymentDialog
        open={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
        total={grandTotal}
        onConfirm={handleMobilePaymentConfirm}
      />

      {/* Last Invoice Dialog */}
      <LastInvoiceDialog
        open={showLastInvoiceDialog}
        onOpenChange={setShowLastInvoiceDialog}
        invoice={lastInvoice}
        formatCurrency={formatCurrency}
      />
    </div>
  )
}