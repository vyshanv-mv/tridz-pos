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
