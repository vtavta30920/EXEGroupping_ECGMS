"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, Layers, AlertCircle } from "lucide-react";
import type { DashboardData } from "@/lib/types/dashboard";

export function OverviewCards({ data }: { data: DashboardData }) {
  type CardItem = {
    label: string;
    value: number;
    icon: any;
    color: string;
    iconColor: string;
  };

  const cards: CardItem[] = [
    {
      label: "Tổng môn học",
      value: data?.totalCourses ?? 0,
      icon: BookOpen,
      color: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Tổng sinh viên",
      value: data?.totalStudents ?? 0,
      icon: Users,
      color: "bg-red-50",
      iconColor: "text-red-600",
    },
    {
      label: "Tổng nhóm",
      value: data?.totalGroups ?? 0,
      icon: Layers,
      color: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Nhóm trống",
      value: data?.emptyGroups ?? 0,
      icon: AlertCircle,
      color: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards
        .filter((c) => !(c.label === "Nhóm trống" && c.value === 0))
        .map((c) => (
          <Card key={c.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{c.label}</p>
                  <p className="text-3xl font-bold mt-2">{c.value}</p>
                </div>
                <div className={`${c.color} p-3 rounded-lg`}>
                  <c.icon className={`w-6 h-6 ${c.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
