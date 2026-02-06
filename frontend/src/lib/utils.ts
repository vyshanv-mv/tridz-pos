import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
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


