import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Customer } from "@/types/customer"

interface CartItem {
  item_code: string
  item_name: string
  qty: number
  rate: number
}

interface Order {
  id: number
  items: CartItem[]
  customer?: Customer
  return_against?: string
}

interface CartState {
  orderCounter: number // Keeps track of the total orders created to generate unique IDs
  orders: Order[]
  activeOrderId: number

  // Actions
  addItem: (item: Omit<CartItem, "qty">) => void
  reduceItem: (itemCode: string) => void
  removeItem: (itemCode: string) => void
  clearCart: () => void
  newOrder: () => void
  closeOrder: (orderId: number) => void
  selectOrder: (orderId: number) => void
  loadOrder: (items: CartItem[], customer?: Customer, return_against?: string) => void
  setCustomer: (customer: Customer | undefined) => void

  // Selectors (helper accessors, though typically used in component selectors)
  getActiveOrder: () => Order | undefined
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      orderCounter: 1,
      orders: [{ id: 1, items: [] }],
      activeOrderId: 1,

      getActiveOrder: () => {
        const { orders, activeOrderId } = get()
        return orders.find(o => o.id === activeOrderId)
      },

      addItem: (item) =>
        set(state => {
          const newOrders = state.orders.map(order => {
            if (order.id !== state.activeOrderId) return order

            const items = [...order.items]
            const idx = items.findIndex(i => i.item_code === item.item_code)

            if (idx > -1) {
              items[idx] = { ...items[idx], qty: items[idx].qty + 1 }
            } else {
              items.push({ ...item, qty: 1 })
            }
            return { ...order, items }
          })
          return { orders: newOrders }
        }),

      reduceItem: (itemCode) =>
        set(state => {
          const newOrders = state.orders.map(order => {
            if (order.id !== state.activeOrderId) return order

            const items = [...order.items]
            const idx = items.findIndex(i => i.item_code === itemCode)

            if (idx > -1) {

              items[idx] = { ...items[idx], qty: items[idx].qty - 1 }
            }
            return { ...order, items }
          })
          return { orders: newOrders }
        }),

      removeItem: (itemCode) =>
        set(state => {
          const newOrders = state.orders.map(order => {
            if (order.id !== state.activeOrderId) return order
            return {
              ...order,
              items: order.items.filter(i => i.item_code !== itemCode)
            }
          })
          return { orders: newOrders }
        }),

      clearCart: () =>
        set(state => {
          const newOrders = state.orders.map(order => {
            if (order.id !== state.activeOrderId) return order
            return { ...order, items: [], customer: undefined, return_against: undefined }
          })
          return { orders: newOrders }
        }),

      newOrder: () =>
        set(state => {
          const newId = state.orderCounter + 1
          return {
            orderCounter: newId,
            orders: [...state.orders, { id: newId, items: [] }],
            activeOrderId: newId
          }
        }),

      closeOrder: (orderId) =>
        set(state => {
          if (state.orders.length <= 1) {
            if (state.orders.length === 1) {
              return {
                orders: [{ ...state.orders[0], items: [], customer: undefined, return_against: undefined }]
              }
            }
          }

          const newOrders = state.orders.filter(o => o.id !== orderId)
          let newActiveId = state.activeOrderId

          if (state.activeOrderId === orderId) {
            const closedIndex = state.orders.findIndex(o => o.id === orderId)
            if (newOrders.length > 0) {
              const nextOrder = newOrders[Math.min(closedIndex, newOrders.length - 1)]
              newActiveId = nextOrder.id
            }
          }

          return {
            orders: newOrders,
            activeOrderId: newActiveId
          }
        }),

      selectOrder: (orderId) => set({ activeOrderId: orderId }),

      loadOrder: (items, customer, return_against) =>
        set(state => {
          const newOrders = state.orders.map(order => {
            if (order.id !== state.activeOrderId) return order
            return { ...order, items, customer, return_against }
          })
          return { orders: newOrders }
        }),

      setCustomer: (customer) =>
        set(state => {
          const newOrders = state.orders.map(order => {
            if (order.id !== state.activeOrderId) return order
            return { ...order, customer }
          })
          return { orders: newOrders }
        }),
    }),
    {
      name: "tridz-pos-cart",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)

export const selectSubtotal = (state: CartState) => {
  const activeOrder = state.orders.find(o => o.id === state.activeOrderId)
  if (!activeOrder) return 0
  return activeOrder.items.reduce((sum, item) => sum + (item.qty * item.rate), 0)
}

export const selectTax = (state: CartState, profile: any) => {
  const subtotal = selectSubtotal(state)
  if (!profile?.taxes || profile.taxes.length === 0) return 0

  let totalTax = 0
  let netTotal = subtotal

  // Handle inclusive taxes first to find the true net total
  const inclusiveTaxes = profile.taxes.filter((t: any) => t.included_in_print_rate)
  if (inclusiveTaxes.length > 0) {
    const totalInclusiveRate = inclusiveTaxes.reduce((sum: number, t: any) => sum + (t.rate || 0), 0)
    netTotal = subtotal / (1 + totalInclusiveRate / 100)
  }

  // Calculate actual tax amounts
  profile.taxes.forEach((tax: any) => {
    if (tax.charge_type === "On Net Total") {
      const amount = netTotal * (tax.rate / 100)
      totalTax += amount
    }
    // Add other charge types if needed (Actual, etc.)
  })



  return totalTax
}

export const calculateTaxBreakdown = (subtotal: number, profile: any) => {
  if (!profile?.taxes || profile.taxes.length === 0) return []

  let netTotal = subtotal

  // Handle inclusive taxes first to find the true net total
  const inclusiveTaxes = profile.taxes.filter((t: any) => t.included_in_print_rate)
  if (inclusiveTaxes.length > 0) {
    const totalInclusiveRate = inclusiveTaxes.reduce((sum: number, t: any) => sum + (t.rate || 0), 0)
    netTotal = subtotal / (1 + totalInclusiveRate / 100)
  }

  const breakdown: { title: string, rate: number, amount: number }[] = []

  // Calculate actual tax amounts
  profile.taxes.forEach((tax: any) => {
    let amount = 0
    if (tax.charge_type === "On Net Total") {
      amount = netTotal * (tax.rate / 100)
    }
    // Add other charge types if needed

    if (amount > 0) {
      breakdown.push({
        title: tax.description || tax.account_head || "Tax",
        rate: tax.rate,
        amount: amount
      })
    }
  })

  return breakdown
}

export const selectGrandTotal = (state: CartState, profile: any) => {
  const subtotal = selectSubtotal(state)
  const taxes = profile?.taxes || []

  // If taxes are inclusive, grand total is just the subtotal (which is the sum of inclusive rates)
  const hasInclusive = taxes.some((t: any) => t.included_in_print_rate)
  if (hasInclusive) {
    // If there are also exclusive taxes on top of inclusive ones, it gets complex.
    // ERPNext usually doesn't mix them in a simple way in POS, but let's handle basic exclusive on top of net.
    const totalInclusiveRate = taxes.filter((t: any) => t.included_in_print_rate)
      .reduce((sum: number, t: any) => sum + (t.rate || 0), 0)
    const netTotal = subtotal / (1 + totalInclusiveRate / 100)

    const exclusiveTax = taxes.filter((t: any) => !t.included_in_print_rate)
      .reduce((sum: number, t: any) => {
        if (t.charge_type === "On Net Total") return sum + (netTotal * (t.rate / 100))
        return sum
      }, 0)

    return Math.round(subtotal + exclusiveTax)
  }

  // Purely exclusive taxes
  const taxAmount = selectTax(state, profile)
  return Math.round(subtotal + taxAmount)
}

// Helper selector for components to get items easily
export const selectActiveItems = (state: CartState) => {
  return state.orders.find(o => o.id === state.activeOrderId)?.items || []
}
