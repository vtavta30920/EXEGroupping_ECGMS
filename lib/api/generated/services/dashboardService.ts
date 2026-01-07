import { mapDashboardData } from "@/lib/utils/dashboardMapper"
import type { DashboardData } from "@/lib/types/dashboard"

export async function getDashboardData() {
  const res = await fetch("/api/proxy/Dashboard/admin", {
    cache: "no-store",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Dashboard fetch failed");

  return res.json();
}
