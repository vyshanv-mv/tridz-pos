import { db, call } from "./frappe"
import { DOCTYPES } from "@/constants/doctypes"
import type { POSProfile } from "@/types/pos"

/**
 * Get POS Profile assigned to current user
 */
export async function getPOSProfile(): Promise<POSProfile> {
  const currentUserResponse = await call.get("frappe.auth.get_logged_user")
  const currentUser = currentUserResponse?.message || currentUserResponse

  // First, get list of all POS Profile names
  const profileList = await db.getDocList<{ name: string }>(DOCTYPES.POS_PROFILE, {
    fields: ["name"],
  })

  if (!profileList.length) {
    throw new Error("No POS Profile found for user")
  }

  // Fetch full documents to get child table data
  const profiles = await Promise.all(
    profileList.map(p => db.getDoc<POSProfile>(DOCTYPES.POS_PROFILE, p.name))
  )

  // Filter profiles based on access control rules
  const filteredProfiles = profiles.filter(profile => {
    // Skip disabled profiles
    if (profile.disabled) return false

    // If no applicable_for_users defined or empty, deny access
    if (!profile.applicable_for_users || profile.applicable_for_users.length === 0) {
      return false
    }

    // Check if current user is in the applicable_for_users list
    return profile.applicable_for_users.some(
      row => row.user === currentUser
    )
  })

  if (!filteredProfiles.length) {
    throw new Error("No POS Profile found for user")
  }

  // Try to find a profile with an open POS Opening Entry
  for (const profile of filteredProfiles) {
    const entry = await getOpeningEntry(profile.name)
    if (entry) {
      return profile // Return the already-fetched full profile
    }
  }

  // If no profile has an open entry, return the first filtered profile
  return filteredProfiles[0]
}

/**
 * Get open POS Opening Entry
 */
export async function getOpeningEntry(posProfile: string) {
  const entries = await db.getDocList(DOCTYPES.POS_OPENING_ENTRY, {
    filters: [
      ["pos_profile", "=", posProfile],
      ["status", "=", "Open"],
    ],
    limit: 1,
  })

  return entries.length ? entries[0] : null
}

/**
 * Get Sales Taxes and Charges Template details
 */
export async function getTaxTemplate(templateName: string) {
  return await db.getDoc(DOCTYPES.SALES_TAXES_AND_CHARGES_TEMPLATE, templateName)
}
