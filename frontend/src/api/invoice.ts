import { db } from "@/api/frappe"
import type { SalesInvoiceItem, Payment } from "@/types/invoice"
import { DOCTYPES } from "@/constants/doctypes"

export async function createDraftPOSInvoice(data: {
    customer: string
    company: string
    pos_profile: string
    pos_opening_entry: string
    currency: string
    warehouse: string
    items: SalesInvoiceItem[]
    payments: Payment[]
    return_against?: string
}) {
    // Calculate grand total from items
    const grandTotal = data.items.reduce((sum, item) => sum + (item.qty * item.rate), 0)
    const paymentAmount = data.payments.length > 0
        ? data.payments.reduce((sum, p) => sum + p.amount, 0)
        : grandTotal

    const payments = data.payments.length > 0
        ? data.payments
        : [] // Will fail validation - payments are mandatory for POS
    //  : [{ mode_of_payment: "Cash", amount: grandTotal }]

    return await db.createDoc(DOCTYPES.POS_INVOICE, {
        doctype: DOCTYPES.POS_INVOICE,
        is_pos: 1,
        customer: data.customer,
        company: data.company,
        pos_profile: data.pos_profile,
        pos_opening_entry: data.pos_opening_entry,
        currency: data.currency,
        update_stock: 1,
        warehouse: data.warehouse,
        is_return: data.return_against ? 1 : 0,
        return_against: data.return_against,

        items: data.items.map(i => ({
            item_code: i.item_code,
            qty: i.qty,
            rate: i.rate,
            warehouse: data.warehouse,
            ...(i.pos_invoice_item && { pos_invoice_item: i.pos_invoice_item }),
        })),

        // MANDATORY POS FIELDS
        payments: payments,
        paid_amount: paymentAmount,
        write_off_amount: 0,
    })
}

export async function getPaidInvoices(page: number = 1, pageSize: number = 20, query: string = "") {
    const offset = (page - 1) * pageSize

    const filters: any[] = [
        ["docstatus", "=", 1],
        ["is_return", "=", 0]
    ]

    let or_filters: any = undefined

    if (query) {
        or_filters = {
            name: ["like", `%${query}%`],
            customer: ["like", `%${query}%`],
            contact_mobile: ["like", `%${query}%`]
        }
    }

    const [invoices, totalCountResult] = await Promise.all([
        db.getDocList(DOCTYPES.POS_INVOICE, {
            filters: filters,
            orFilters: or_filters,
            fields: ["name", "customer", "contact_mobile", "posting_date", "posting_time", "grand_total", "status", "currency", "is_return", "total_qty", "items"],
            orderBy: {
                field: "modified",
                order: "desc"
            },
            limit: pageSize,
            limit_start: offset,
        }),
        // Get total count
        db.getDocList(DOCTYPES.POS_INVOICE, {
            filters: filters,
            orFilters: or_filters,
            fields: ["name"],
            limit: 0,
        })
    ])

    return {
        invoices,
        total: totalCountResult.length || 0,
        totalPages: Math.ceil((totalCountResult.length || 0) / pageSize),
        currentPage: page
    }
}



export async function getAllInvoices(page: number = 1, pageSize: number = 5, query: string = "") {
    const offset = (page - 1) * pageSize

    let or_filters: any = undefined

    if (query) {
        or_filters = {
            name: ["like", `%${query}%`],
            customer: ["like", `%${query}%`],
            contact_mobile: ["like", `%${query}%`]
        }
    }

    const [invoices, totalCountResult] = await Promise.all([
        db.getDocList(DOCTYPES.POS_INVOICE, {
            filters: [],
            orFilters: or_filters,
            fields: ["name", "customer", "contact_mobile", "posting_date", "posting_time", "grand_total", "status", "currency", "is_return", "total_qty", "docstatus", "items"],
            orderBy: {
                field: "modified",
                order: "desc"
            },
            limit: pageSize,
            limit_start: offset,
        }),
        // Get total count
        db.getDocList(DOCTYPES.POS_INVOICE, {
            filters: [],
            orFilters: or_filters,
            fields: ["name"],
            limit: 0,
        })
    ])

    return {
        invoices,
        total: totalCountResult.length || 0,
        totalPages: Math.ceil((totalCountResult.length || 0) / pageSize),
        currentPage: page
    }
}

export async function getInvoice(name: string) {
    return await db.getDoc(DOCTYPES.POS_INVOICE, name)
}

export async function deleteInvoice(name: string) {
    return await db.deleteDoc(DOCTYPES.POS_INVOICE, name)
}

export async function submitInvoice(name: string) {
    return await db.updateDoc(DOCTYPES.POS_INVOICE, name, {
        docstatus: 1
    })
}
