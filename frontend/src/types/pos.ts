export interface POSProfile {
  name: string
  company: string
  currency: string
  selling_price_list: string
  warehouse: string
  customer?: string
  disabled?: number
  print_format?: string
  print_receipt_on_order_complete?: number
  applicable_for_users?: {
    user: string
  }[]
  payments: {
    mode_of_payment: string
    default: number
  }[]
  item_groups: {
    item_group: string
  }[]
  taxes_and_charges?: string
  taxes?: TaxRow[]
}

export interface TaxRow {
  charge_type: string
  account_head: string
  description?: string
  rate: number
  included_in_print_rate?: number
  cost_center?: string
  tax_amount?: number
  total?: number
}

export interface POSOpeningEntry {
  name: string
  pos_profile: string
  period_start_date: string
  status: string
  company: string
  pos_closing_entry?: string
  balance_details?: {
    mode_of_payment: string
    opening_amount: number
  }[]
}
