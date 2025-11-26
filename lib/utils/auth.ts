import type { User } from "@/lib/types";

// Utility functions for authentication - Replace with proper auth later
export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;

  const userStr = localStorage.getItem("currentUser");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

export function hasRole(role: string): boolean {
  const user = getCurrentUser();
  return user?.role === role;
}

export function updateCurrentUser(user: User): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("currentUser", JSON.stringify(user));
  } catch (err) {
    console.error("Failed to update current user in localStorage", err);
  }
}

/**
 * Decode JWT token and extract role from claims
 * JWT format: header.payload.signature
 * Role is stored in: http://schemas.microsoft.com/ws/2008/06/identity/claims/role
 */
export function decodeJWT(
  token: string
): { role?: string; [key: string]: any } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    // Decode payload (second part)
    const payload = parts[1];
    // Replace URL-safe base64 characters
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    // Add padding if needed
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

    // Decode base64
    const decoded = atob(padded);
    const parsed = JSON.parse(decoded);

    // Extract role from claims
    const roleClaim =
      parsed["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    return {
      ...parsed,
      role: roleClaim ? roleClaim.toLowerCase() : undefined,
    };
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}
