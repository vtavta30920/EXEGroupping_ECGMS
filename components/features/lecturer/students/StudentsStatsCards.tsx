"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, UserX, GraduationCap } from "lucide-react";
import type { StudentWithoutGroup } from "@/lib/types/student";

interface StudentsStatsCardsProps {
  students: StudentWithoutGroup[];
  filteredCount: number;
}

export function StudentsStatsCards({
  students,
  filteredCount,
}: StudentsStatsCardsProps) {
  const total = students.length;
  const seCount = students.filter((s) => s.majorCode === "SE").length;
  const ssCount = students.filter((s) => s.majorCode === "SS").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">
            Tổng số sinh viên
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-2xl font-bold">{total}</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">
            Kết quả theo bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <UserX className="w-5 h-5 text-orange-600" />
            <span className="text-2xl font-bold">
              {filteredCount}
              <span className="text-sm text-gray-500 font-normal">/{total}</span>
            </span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">
            SV ngành SE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <span className="text-2xl font-bold">
              {seCount}
              <span className="text-sm text-gray-500 font-normal">
                {" "}
                ({total > 0 ? ((seCount / total) * 100).toFixed(1) : 0}%)
              </span>
            </span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">
            SV ngành SS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-pink-600" />
            <span className="text-2xl font-bold">
              {ssCount}
              <span className="text-sm text-gray-500 font-normal">
                {" "}
                ({total > 0 ? ((ssCount / total) * 100).toFixed(1) : 0}%)
              </span>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

