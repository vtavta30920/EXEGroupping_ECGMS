"use client";

import type { DashboardData } from "@/lib/types/dashboard";
import { DashboardHeader } from "./DashboardHeader";
import { OverviewCards } from "./OverviewCards";
import { CourseProgressChart } from "./CourseProgressChart";
import { AttentionSection } from "./AttentionSection";
import { ActionsSection } from "./ActionsSection";

export function DashboardUI({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-6">
      <DashboardHeader />
      <OverviewCards data={data} />
      <CourseProgressChart data={data} />
      <AttentionSection data={data} />
      <ActionsSection />
    </div>
  );
}
