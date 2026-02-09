export const DOCTYPES = {
    // POS Core
    POS_PROFILE: "POS Profile",
    POS_OPENING_ENTRY: "POS Opening Entry",
    POS_CLOSING_ENTRY: "POS Closing Entry",

    // Pos
    POS_INVOICE: "POS Invoice",
    POS_INVOICE_ITEM: "POS Invoice Item",

    // Items
    ITEM: "Item",
    ITEM_GROUP: "Item Group",
    ITEM_PRICE: "Item Price",
    PRICE_LIST: "Price List",
    BIN: "Bin",

    // Payments
    MODE_OF_PAYMENT: "Mode of Payment",

    // Customers
    CUSTOMER: "Customer",
    CUSTOMER_GROUP: "Customer Group",
    TERRITORY: "Territory",

    // Company & Warehouse
    COMPANY: "Company",
    WAREHOUSE: "Warehouse",
    CURRENCY: "Currency",

    // Taxes
    SALES_TAXES_AND_CHARGES_TEMPLATE: "Sales Taxes and Charges Template",

    // User
    USER: "User",
} as const

export type DoctypeName = typeof DOCTYPES[keyof typeof DOCTYPES]
