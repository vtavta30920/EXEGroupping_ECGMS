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
            <span className="text-2xl font-bold">{students.length}</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">
            Đang hiển thị
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <UserX className="w-5 h-5 text-orange-600" />
            <span className="text-2xl font-bold">{filteredCount}</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">
            Ngành SE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <span className="text-2xl font-bold">
              {students.filter((s) => s.majorCode === "SE").length}
            </span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">
            Ngành SS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-pink-600" />
            <span className="text-2xl font-bold">
              {students.filter((s) => s.majorCode === "SS").length}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

