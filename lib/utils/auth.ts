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
 * Get userId from JWT token nameidentifier claim
 */
export function getUserIdFromJWT(): string | null {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const decoded = decodeJWT(token);
    // Priority: nameidentifier > nameid > sub
    const userId = decoded?.nameidentifier || decoded?.nameid || decoded?.sub;

    if (userId) {
      const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      if (guidRegex.test(userId)) {
        console.log("✅ [getUserIdFromJWT] Found valid userId:", userId);
        return userId;
      } else {
        console.warn("❌ [getUserIdFromJWT] userId is not a valid GUID:", userId);
      }
    } else {
      console.warn("❌ [getUserIdFromJWT] No userId found in JWT claims");
    }
  } catch (error) {
    console.warn("❌ [getUserIdFromJWT] Failed to decode JWT:", error);
  }

  return null;
}

/**
 * Fix existing user data if userId is not a valid GUID
 * This is useful when user data was corrupted during development
 */
export async function fixUserData(): Promise<User | null> {
  if (typeof window === "undefined") return null;

  const user = getCurrentUser();
  if (!user) return null;

  // Always try to get the correct userId from JWT first
  const jwtUserId = getUserIdFromJWT();
  if (jwtUserId && jwtUserId !== user.userId) {
    console.log("🔄 [fixUserData] Updating userId from JWT:", jwtUserId);
    const fixedUser = { ...user, userId: jwtUserId };
    updateCurrentUser(fixedUser);
    return fixedUser;
  }

  // If JWT userId matches current userId, check if it's valid
  const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (guidRegex.test(user.userId)) {
    console.log("✅ [fixUserData] userId is already valid:", user.userId);
    return user;
  }

  // Fallback: Try to get userId from API using email
  try {
    const { UserService } = await import('@/lib/api/generated');
    const userFromApi = await UserService.getApiUserEmail({ email: user.email });
    if (userFromApi?.id && guidRegex.test(userFromApi.id)) {
      console.log("✅ [fixUserData] Found userId from API:", userFromApi.id);
      const fixedUser = { ...user, userId: userFromApi.id };
      updateCurrentUser(fixedUser);
      return fixedUser;
    }
  } catch (apiError) {
    console.warn("❌ [fixUserData] Failed to get userId from API:", apiError);
  }

  console.error("❌ [fixUserData] Could not fix userId - it remains invalid:", user.userId);
  return user;
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
