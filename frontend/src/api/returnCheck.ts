import { db } from "@/api/frappe"
import { DOCTYPES } from "@/constants/doctypes"

/**
 * Check if an invoice already has a return created against it
 */
export async function checkIfInvoiceHasReturn(invoiceName: string): Promise<string | null> {
    try {
        const returns = await db.getDocList(DOCTYPES.POS_INVOICE, {
            filters: [
                ["is_return", "=", 1],
                ["return_against", "=", invoiceName],
                ["docstatus", "!=", 2] // Not cancelled
            ],
            fields: ["name"],
            limit: 1
        })
        return returns.length > 0 ? returns[0].name : null
    } catch (error) {
        console.error("Error checking for existing returns:", error)
        return null
    }
}
