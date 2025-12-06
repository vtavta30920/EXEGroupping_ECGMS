import useSWR from "swr";
import { getDashboardData } from "../api/generated/services/dashboardService";
import type { DashboardData } from "@/lib/types/dashboard";

export function useDashboard() {
  const { data, error, isLoading, mutate } = useSWR<DashboardData>(
    "/api/dashboard/admin",
    getDashboardData,
    {
      dedupingInterval: 15000,      // giảm call API
      revalidateOnFocus: false,
      shouldRetryOnError: true,
      errorRetryCount: 3,
    }
  );

  return {
    data,
    error,
    loading: isLoading,
    refresh: mutate,
  };
}
