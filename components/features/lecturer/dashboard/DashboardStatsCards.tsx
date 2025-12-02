"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Users, AlertTriangle } from "lucide-react";

interface DashboardStats {
  totalCourses: number;
  totalGroups: number;
  totalStudents: number;
  averageGroupSize: number;
  groupsWithMembers: number;
  emptyGroups: number;
}

interface DashboardStatsCardsProps {
  stats: DashboardStats;
}

export function DashboardStatsCards({ stats }: DashboardStatsCardsProps) {
  const statsCards = [
    {
      title: "Tổng số nhóm",
      value: stats.totalGroups,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: `${stats.groupsWithMembers} nhóm có thành viên`,
    },
    {
      title: "Tổng số sinh viên",
      value: stats.totalStudents,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: `Trung bình ${stats.averageGroupSize} SV/nhóm`,
    },
    {
      title: "Nhóm trống",
      value: stats.emptyGroups,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      description: "Cần thêm thành viên",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((stat) => (
        <Card
          key={stat.title}
          className="hover:shadow-lg transition-shadow"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {stat.description}
                </p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

