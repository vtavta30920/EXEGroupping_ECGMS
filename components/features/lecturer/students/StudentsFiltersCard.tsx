"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Filter, Code } from "lucide-react";
import type { StudentWithoutGroup } from "@/lib/types/student";

interface StudentsFiltersCardProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterMajor: string;
  onMajorChange: (value: string) => void;
  filterSkill: string;
  onSkillChange: (value: string) => void;
  students: StudentWithoutGroup[];
}

export function StudentsFiltersCard({
  searchTerm,
  onSearchChange,
  filterMajor,
  onMajorChange,
  filterSkill,
  onSkillChange,
  students,
}: StudentsFiltersCardProps) {
  const uniqueMajors = Array.from(
    new Set(students.map((s) => s.majorCode))
  ).sort();
  const uniqueSkills = Array.from(
    new Set(students.map((s) => s.coreSkill))
  ).sort();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bộ lọc</CardTitle>
        <CardDescription>Tìm kiếm và lọc danh sách sinh viên</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm theo tên, email, username..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              value={filterMajor}
              onChange={(e) => onMajorChange(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Tất cả ngành</option>
              {uniqueMajors.map((major) => (
                <option key={major} value={major}>
                  {major}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-gray-600" />
            <select
              value={filterSkill}
              onChange={(e) => onSkillChange(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Tất cả kỹ năng</option>
              {uniqueSkills.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
