// Authentication service - wired to Next API routes
import type { User, LoginForm } from "@/lib/types"

export class AuthService {
  // Login user via Next.js API route that forwards to backend
  static async login(credentials: LoginForm): Promise<any> {
    const payload = {
      username: credentials.username,
      password: credentials.password || "12345678", // default theo yêu cầu
    };

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || 'Login failed');
    }

    // Response có thể chứa { token, user } hoặc chỉ user
    const data = await res.json();
    return data;
  }

  // Logout user (optional: clear local state; server cookie sẽ hết hạn tự nhiên)
  static async logout(): Promise<void> {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
    } catch {}
  }

  // Get current user via server me route (nếu cần)
  static async getCurrentUser(): Promise<User | null> {
    const res = await fetch('/api/auth/me', { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  }
}