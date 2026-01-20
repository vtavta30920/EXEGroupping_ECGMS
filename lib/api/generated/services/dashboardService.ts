import type { DashboardData } from "@/lib/types/dashboard";

export async function getDashboardData(url: string): Promise<DashboardData> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 8000);

  const res = await fetch(url, {
    credentials: "include",
    cache: "no-store",
    signal: controller.signal,
  });

  clearTimeout(t);

  if (!res.ok) {
    throw new Error(`Dashboard fetch failed: ${res.status}`);
  }

  return res.json();
}
