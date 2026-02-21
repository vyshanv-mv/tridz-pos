import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'INR') {
    return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
    }).format(amount)
}

interface PrintOptions {
    doctype?: string
    name: string
    format: string
    noLetterhead?: boolean
    autoPrint?: boolean
}


export function printERPNextDoc({
    doctype = "POS Invoice",
    name,
    format,
    noLetterhead = true,
    autoPrint = false,
}: PrintOptions) {
    if (!name) {
        throw new Error("Document name is required for printing")
    }

    const params = new URLSearchParams({
        doctype,
        name,
        format,
    })

    if (noLetterhead) {
        params.append("no_letterhead", "1")
    }

    const printUrl = `/printview?${params.toString()}`

    const win = window.open(printUrl, "_blank")

    if (autoPrint && win) {
        win.onload = () => {
            win.print()
        }
    }
}
export interface TaxDisplayRow {
    label: string
    rate: number
    amount: number
}


export function buildTaxRows(
    taxes: any[] | undefined | null,
    ratio: number = 1,
    fallbackTotal: number = 0
): TaxDisplayRow[] {
    if (taxes?.length) {
        return taxes.map(t => ({
            label: t.description || t.account_head || 'Tax',
            rate: t.rate || 0,
            amount: (t.tax_amount || 0) * ratio,
        }))
    }
    if (fallbackTotal !== 0) {
        return [{ label: 'Tax', rate: 0, amount: fallbackTotal * ratio }]
    }
    return []
}
