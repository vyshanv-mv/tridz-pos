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
    taxes?: any[]
    taxes_and_charges?: string
    return_against?: string
    grand_total?: number
}) {
    // If it's a return, we skip frontend calculations entirely and let ERPNext handle it
    if (data.return_against) {
        const payload = {
            doctype: DOCTYPES.POS_INVOICE,
            is_pos: 1,
            customer: data.customer,
            company: data.company,
            pos_profile: data.pos_profile,
            pos_opening_entry: data.pos_opening_entry,
            currency: data.currency,
            update_stock: 1,
            warehouse: data.warehouse,
            is_return: 1,
            return_against: data.return_against,

            items: data.items.map(i => ({
                item_code: i.item_code,
                qty: i.qty,
                rate: i.rate,
                warehouse: data.warehouse,
                ...(i.pos_invoice_item && { pos_invoice_item: i.pos_invoice_item }),
            })),

            taxes_and_charges: data.taxes_and_charges,
            taxes: data.taxes,

            payments: data.payments,
            paid_amount: data.payments.reduce((sum, p) => sum + p.amount, 0),
        }
        return await db.createDoc(DOCTYPES.POS_INVOICE, payload)
    }

    // ERPNext will recalculate, but we send our calculated values to be sure
    const round = (val: number) => Math.round(val * 100) / 100
    const subtotal = round(data.items.reduce((sum, item) => sum + (item.qty * item.rate), 0))

    let totalTaxes = 0
    if (data.taxes) {
        // Simple calculation for draft - ERPNext validates this on save
        // We handle net total for inclusive taxes
        const totalInclusiveRate = data.taxes
            .filter((t: any) => t.included_in_print_rate)
            .reduce((sum: number, t: any) => sum + (t.rate || 0), 0)

        const netTotal = totalInclusiveRate > 0
            ? subtotal / (1 + totalInclusiveRate / 100)
            : subtotal

        data.taxes.forEach(t => {
            t.tax_amount = round(netTotal * (t.rate / 100))
            t.base_tax_amount = t.tax_amount // Assuming same currency for now
            totalTaxes += t.tax_amount
        })
    }

    const grandTotal = data.grand_total !== undefined
        ? Math.round(data.grand_total)
        : Math.round(subtotal + (data.taxes?.filter(t => !t.included_in_print_rate).reduce((s, t) => s + t.tax_amount, 0) || 0))

    // For POS, paid_amount MUST equal grand_total
    // We strictly use grandTotal for paid_amount regardless of minor rounding in payments table sum
    const payments = data.payments.map(p => ({
        ...p,
        amount: round(p.amount)
    }))

    const payload = {
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
        taxes_and_charges: data.taxes_and_charges,

        items: data.items.map(i => ({
            item_code: i.item_code,
            qty: i.qty,
            rate: i.rate,
            warehouse: data.warehouse,
            ...(i.pos_invoice_item && { pos_invoice_item: i.pos_invoice_item }),
        })),

        // TAXES
        taxes: data.taxes || [],
        total_taxes_and_charges: round(totalTaxes),

        // MANDATORY POS FIELDS
        payments: payments,
        paid_amount: grandTotal,
        grand_total: grandTotal,
        write_off_amount: 0,
    }

    return await db.createDoc(DOCTYPES.POS_INVOICE, payload)
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
