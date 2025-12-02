"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserX, Mail } from "lucide-react";
import type { StudentWithoutGroup } from "@/lib/types/student";

interface StudentsTableProps {
  students: StudentWithoutGroup[];
  startIndex: number;
  loading: boolean;
  searchTerm: string;
  filterMajor: string;
  filterSkill: string;
}

export function StudentsTable({
  students,
  startIndex,
  loading,
  searchTerm,
  filterMajor,
  filterSkill,
}: StudentsTableProps) {
  const getSkillBadgeColor = (skill: string) => {
    switch (skill.toLowerCase()) {
      case "frontend":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "backend":
        return "bg-green-100 text-green-700 border-green-200";
      case "marketing":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "saleing":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getMajorBadgeColor = (major: string) => {
    return major === "SE"
      ? "bg-indigo-100 text-indigo-700 border-indigo-200"
      : "bg-pink-100 text-pink-700 border-pink-200";
  };

  return (
    <>
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-8">
          <UserX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {searchTerm || filterMajor !== "all" || filterSkill !== "all"
              ? "Không tìm thấy sinh viên nào phù hợp với bộ lọc"
              : "Không có sinh viên nào chưa có nhóm"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>STT</TableHead>
                <TableHead>Họ và tên</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Ngành</TableHead>
                <TableHead>Kỹ năng chính</TableHead>
                <TableHead>Skill Set</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student, index) => (
                <TableRow key={student.studentId}>
                  <TableCell className="font-medium">
                    {startIndex + index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                        {student.userProfileViewModel.fullName
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <span className="font-medium">
                        {student.userProfileViewModel.fullName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-600">
                      {student.user.username}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {student.user.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getMajorBadgeColor(student.majorCode)}
                    >
                      {student.majorCode} -{" "}
                      {student.userProfileViewModel.major.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getSkillBadgeColor(student.coreSkill)}
                    >
                      {student.coreSkill}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {student.user.skillSet}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}

