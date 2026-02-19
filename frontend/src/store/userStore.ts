import { create } from "zustand"
import { getLoggedUser, getUserDetails, login, logout, type UserDetails } from "@/api/user"

interface UserState {
    currentUser: UserDetails | null
    loading: boolean
    error: string | null

    initSession: () => Promise<void>
    login: (username: string, password: string) => Promise<void>
    logout: () => Promise<void>
}

export const useUserStore = create<UserState>((set) => ({
    currentUser: null,
    loading: false,
    error: null,

    initSession: async () => {
        try {
            set({ loading: true, error: null })
            const userId = await getLoggedUser()

            // Check for valid user and ensure it's not the guest user
            if (!userId || userId === "Guest") {
                set({ currentUser: null, loading: false })
                return
            }

            const userDetails = await getUserDetails(userId)
            set({ currentUser: userDetails, loading: false })
        } catch (e: any) {
            console.error("Failed to init user session:", e)
            set({ currentUser: null, loading: false })
        }
    },

    login: async (username, password) => {
        try {
            set({ loading: true, error: null })
            await login(username, password)
            const userId = await getLoggedUser()
            const userDetails = await getUserDetails(userId)
            set({ currentUser: userDetails, loading: false })
        } catch (e: any) {
            set({ loading: false, error: e.message || "Login failed" })
            throw e
        }
    },

    logout: async () => {
        // Clear local state first
        set({ currentUser: null, loading: false, error: null })
        // Call logout API which will redirect to login page
        logout()
    },
}))
