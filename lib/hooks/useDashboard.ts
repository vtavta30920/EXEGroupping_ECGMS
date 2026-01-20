import useSWR from "swr";
import { getDashboardData } from "../api/generated/services/dashboardService";
import type { DashboardData } from "@/lib/types/dashboard";

export function useDashboard() {
  const { data, error, isLoading, mutate } = useSWR<DashboardData>(
    "/api/proxy/Dashboard/admin",
    getDashboardData,
    {
      dedupingInterval: 15000,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      errorRetryCount: 0,
    }
  );

  return { data, error, loading: isLoading, refresh: mutate };
}
