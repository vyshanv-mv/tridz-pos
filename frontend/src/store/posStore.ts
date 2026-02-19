import { create } from "zustand"
import type { POSProfile, POSOpeningEntry } from "@/types/pos"
import { getPOSProfile, getOpeningEntry, getTaxTemplate } from "@/api/pos"

interface PosState {
  profile: POSProfile | null
  openingEntry: POSOpeningEntry | null
  loading: boolean
  error: string | null
  showItemImages: boolean

  loadProfile: () => Promise<void>
  toggleShowItemImages: () => void
}

export const usePosStore = create<PosState>((set) => ({
  profile: null,
  openingEntry: null,
  loading: false,
  error: null,
  showItemImages: localStorage.getItem('showItemImages') !== 'false', // Default to true

  loadProfile: async () => {
    try {
      set({ loading: true, error: null })

      const profile = await getPOSProfile()
      const opening = await getOpeningEntry(profile.name)

      if (!opening) {
        sessionStorage.clear()
        throw new Error("POS Opening Entry not found. Please create a POS Opening Entry first.")
      }

      // Fetch taxes if available
      if (profile.taxes_and_charges) {
        try {
          const taxTemplate = await getTaxTemplate(profile.taxes_and_charges)
          profile.taxes = taxTemplate.taxes || []
        } catch (e) {
          console.error("Failed to load tax template:", e)
        }
      }

      set({
        profile,
        openingEntry: opening,
        loading: false,
      })
    } catch (e: any) {
      set({
        error: e.message,
        loading: false,
      })
    }
  },

  toggleShowItemImages: () => {
    set((state) => {
      const newValue = !state.showItemImages
      localStorage.setItem('showItemImages', String(newValue))
      return { showItemImages: newValue }
    })
  },
}))
