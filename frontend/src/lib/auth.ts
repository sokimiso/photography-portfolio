import apiClient from "./apiClient";

export interface AuthUser {
  id: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
  firstName?: string;
  lastName?: string;
}

/**
 * Get currently authenticated user
 * using HTTP-only auth cookie.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const res = await apiClient.get("/auth/me");

    return res.data?.user ?? null;
  } catch (err) {
    console.error("Failed to fetch current user:", err);
    return null;
  }
}
