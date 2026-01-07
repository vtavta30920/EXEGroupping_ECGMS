"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download } from "lucide-react";
import { getCurrentUser } from "@/lib/utils/auth";
import { useToast } from "@/lib/hooks/use-toast";
import { LecturerService } from "@/lib/api/lecturerService";
import type { StudentWithoutGroup } from "@/lib/types/student";
import { StudentsStatsCards } from "@/components/features/lecturer/students/StudentsStatsCards";
import { StudentsFiltersCard } from "@/components/features/lecturer/students/StudentsFiltersCard";
import { StudentsTable } from "@/components/features/lecturer/students/StudentsTable";
import { StudentsPagination } from "@/components/features/lecturer/students/StudentsPagination";
import * as XLSX from "xlsx";
import { useDebounce } from "@/lib/hooks/useDebounce";

export default function StudentsWithoutGroupPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<StudentWithoutGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMajor, setFilterMajor] = useState<string>("all");
  const [filterSkill, setFilterSkill] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { toast } = useToast();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // load students without group
  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await LecturerService.getStudentsWithoutGroup();
      // Ensure data is an array
      const studentsArray = Array.isArray(data) ? data : [];
      setStudents(studentsArray);
    } catch (error) {
      console.error("Error loading students:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách sinh viên";
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
      // Set empty arrays on error
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== "lecturer") {
      router.push("/login");
      return;
    }
    setUser(currentUser);
    loadStudents();
  }, [router, loadStudents]);

  // Memoized filtered and sorted students - more efficient than useEffect
  const filteredStudents = useMemo(() => {
    // Ensure students is always an array
    if (!Array.isArray(students)) {
      return [];
    }

    let filtered = [...students];

    // Filter by search term
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.userProfileViewModel.fullName.toLowerCase().includes(term) ||
          student.user.username.toLowerCase().includes(term) ||
          student.user.email.toLowerCase().includes(term) ||
          student.studentId.toLowerCase().includes(term)
      );
    }

    // Filter by major
    if (filterMajor !== "all") {
      filtered = filtered.filter(
        (student) => student.majorCode === filterMajor
      );
    }

    // Filter by skill
    if (filterSkill !== "all") {
      filtered = filtered.filter(
        (student) => student.coreSkill === filterSkill
      );
    }

    // Sort: first by major code (SE before SS), then by core skill, then by full name
    filtered.sort((a, b) => {
      // Sort by major code first (SE comes before SS)
      if (a.majorCode !== b.majorCode) {
        return a.majorCode.localeCompare(b.majorCode);
      }
      // Then by core skill
      if (a.coreSkill !== b.coreSkill) {
        return a.coreSkill.localeCompare(b.coreSkill);
      }
      // Finally by full name
      return a.userProfileViewModel.fullName.localeCompare(
        b.userProfileViewModel.fullName,
        "vi"
      );
    });

    return filtered;
  }, [debouncedSearchTerm, filterMajor, filterSkill, students]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterMajor, filterSkill]);

  // Calculate pagination - ensure filteredStudents is always an array
  const safeFilteredStudents = Array.isArray(filteredStudents)
    ? filteredStudents
    : [];
  const totalPages = Math.ceil(safeFilteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStudents = safeFilteredStudents.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const exportToExcel = () => {
    try {
      // Prepare data for Excel
      const excelData = safeFilteredStudents.map((student) => ({
        "Mã sinh viên": student.studentId,
        "Tên đăng nhập": student.user.username,
        "Họ và tên": student.userProfileViewModel.fullName,
        Email: student.user.email,
        "Mã ngành": student.majorCode,
        "Tên ngành": student.userProfileViewModel.major.name,
        "Kỹ năng chính": student.coreSkill,
        Bio: student.userProfileViewModel.bio,
      }));

      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Sinh viên chưa có nhóm"
      );

      // Set column widths
      const columnWidths = [
        { wch: 40 }, // Mã sinh viên
        { wch: 20 }, // Tên đăng nhập
        { wch: 30 }, // Họ và tên
        { wch: 35 }, // Email
        { wch: 12 }, // Mã ngành
        { wch: 30 }, // Tên ngành
        { wch: 20 }, // Kỹ năng chính
        { wch: 15 }, // Bio
      ];
      worksheet["!cols"] = columnWidths;

      // Generate filename with current date
      const date = new Date();
      const dateStr = date.toISOString().split("T")[0];
      const filename = `Sinh_vien_chua_co_nhom_${dateStr}.xlsx`;

      // Download file
      XLSX.writeFile(workbook, filename);

      toast({
        title: "Xuất Excel thành công",
        description: `Đã xuất ${safeFilteredStudents.length} sinh viên ra file Excel`,
      });
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xuất file Excel",
        variant: "destructive",
      });
    }
  };

  // Show loading state instead of blocking with return null
  if (!user) {
    return (
      <DashboardLayout role="lecturer">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="lecturer">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Sinh viên chưa có nhóm
            </h1>
            <p className="text-gray-600 mt-1">
              Danh sách sinh viên chưa được phân vào nhóm nào
            </p>
          </div>
          <Button
            onClick={exportToExcel}
            className="bg-green-600 hover:bg-green-700"
            disabled={safeFilteredStudents.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Xuất Excel
          </Button>
        </div>

        <StudentsStatsCards
          students={students}
          filteredCount={safeFilteredStudents.length}
        />

        <StudentsFiltersCard
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterMajor={filterMajor}
          onMajorChange={setFilterMajor}
          filterSkill={filterSkill}
          onSkillChange={setFilterSkill}
          students={students}
        />

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Danh sách sinh viên</CardTitle>
                <CardDescription>
                  Hiển thị {startIndex + 1}-
                  {Math.min(endIndex, safeFilteredStudents.length)} trong tổng
                  số {safeFilteredStudents.length} sinh viên
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Số dòng/trang:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <StudentsTable
              students={paginatedStudents}
              startIndex={startIndex}
              loading={loading}
              searchTerm={searchTerm}
              filterMajor={filterMajor}
              filterSkill={filterSkill}
            />
            {!loading && safeFilteredStudents.length > 0 && (
              <StudentsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
