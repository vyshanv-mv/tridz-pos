import type { TaxRow } from "./pos"

// Types for Invoice
export interface SalesInvoiceItem {
  item_code: string
  qty: number
  rate: number
  item_name?: string
  description?: string
  warehouse?: string
  uom?: string
  conversion_factor?: number
  pos_invoice_item?: string // For return invoices - links to original invoice item row
}

export interface Payment {
  mode_of_payment: string
  amount: number
}

export interface SalesInvoice {
  name?: string
  customer: string
  company: string
  pos_profile: string
  pos_opening_entry: string
  currency: string
  warehouse: string
  items: SalesInvoiceItem[]
  payments: Payment[]
  taxes?: TaxRow[]
  taxes_and_charges?: string
  total_taxes_and_charges?: number
  grand_total?: number
  is_pos: number
  update_stock: number
  is_return?: number
  return_against?: string
  paid_amount?: number
  write_off_amount?: number
}
