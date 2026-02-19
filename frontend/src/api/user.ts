import { db, auth } from "./frappe"
import { DOCTYPES } from "@/constants/doctypes"

export interface UserDetails {
    name: string
    email: string
    full_name: string
    user_image?: string
    roles?: { role: string }[]
}

export async function getLoggedUser(): Promise<string> {
    const result = await auth.getLoggedInUser()
    return result
}

export async function getUserDetails(userId: string): Promise<UserDetails> {
    // If userId is not provided or invalid, return basic info or throw
    if (!userId) throw new Error("User ID is required")

    const user = await db.getDoc<UserDetails>(DOCTYPES.USER, userId)
    return user
}

export async function login(username: string, password: string): Promise<void> {
    await auth.loginWithUsernamePassword({ username, password })
}

export async function logout(): Promise<void> {
    try {
        await auth.logout()
    } catch (e) {
        console.error("Logout failed", e)
    } finally {
        // 1. Clear frontend-only state
        sessionStorage.clear()
        localStorage.clear()
        window.location.href = "/pos"
    }
}
