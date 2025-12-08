"use client";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { DashboardUI } from "./components/DashboardUI";
import DashboardLoading from "./components/DashboardLoading"; // Import component

export default function AdminDashboardPage() {
  const { data, loading, error } = useDashboard();

  if (loading) return <DashboardLoading />;
  if (error) return <div className="p-6">Không tải được dữ liệu Dashboard</div>;

  return (
    <DashboardLayout role="admin">
      <DashboardUI data={data!} />
    </DashboardLayout>
  );
}
