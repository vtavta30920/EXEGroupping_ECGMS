"use client";

import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  Search,
  UserX,
  Filter,
  Users,
  Mail,
  GraduationCap,
  Code,
} from "lucide-react";
import { getCurrentUser } from "@/lib/utils/auth";
import { useToast } from "@/lib/hooks/use-toast";
import { LecturerService } from "@/lib/api/lecturerService";
import type { StudentWithoutGroup } from "@/lib/types";
import * as XLSX from "xlsx";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useDebounce } from "@/lib/hooks/useDebounce";

export default function StudentsWithoutGroupPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<StudentWithoutGroup[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<
    StudentWithoutGroup[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMajor, setFilterMajor] = useState<string>("all");
  const [filterSkill, setFilterSkill] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { toast } = useToast();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== "lecturer") {
      router.push("/login");
      return;
    }
    setUser(currentUser);
    loadStudents();
  }, [router]);

  // load students without group
  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await LecturerService.getStudentsWithoutGroup();
      // Ensure data is an array
      const studentsArray = Array.isArray(data) ? data : [];
      setStudents(studentsArray);
      setFilteredStudents(studentsArray);
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
      setFilteredStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Ensure students is always an array
    if (!Array.isArray(students)) {
      setFilteredStudents([]);
      return;
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

    setFilteredStudents(filtered);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterMajor, filterSkill, students]);

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
        Ngành: student.majorCode,
        "Tên ngành": student.userProfileViewModel.major.name,
        "Kỹ năng chính": student.coreSkill,
        "Skill Set": student.user.skillSet,
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
        { wch: 10 }, // Ngành
        { wch: 30 }, // Tên ngành
        { wch: 20 }, // Kỹ năng chính
        { wch: 20 }, // Skill Set
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

  if (!user) return null;

  // Get unique majors and skills for filters
  const uniqueMajors = Array.from(
    new Set(students.map((s) => s.majorCode))
  ).sort();
  const uniqueSkills = Array.from(
    new Set(students.map((s) => s.coreSkill))
  ).sort();

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

        {/* Stats Cards */}
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
                <span className="text-2xl font-bold">
                  {safeFilteredStudents.length}
                </span>
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

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Bộ lọc</CardTitle>
            <CardDescription>
              Tìm kiếm và lọc danh sách sinh viên
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm theo tên, email, username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <select
                  value={filterMajor}
                  onChange={(e) => setFilterMajor(e.target.value)}
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
                  onChange={(e) => setFilterSkill(e.target.value)}
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

        {/* Students Table */}
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
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Đang tải dữ liệu...</p>
              </div>
            ) : safeFilteredStudents.length === 0 ? (
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
                    {paginatedStudents.map((student, index) => (
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

            {/* Pagination */}
            {!loading && safeFilteredStudents.length > 0 && totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Trang {currentPage} / {totalPages}
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) {
                            handlePageChange(currentPage - 1);
                          }
                        }}
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {/* First page */}
                    {currentPage > 2 && (
                      <>
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(1);
                            }}
                            className="cursor-pointer"
                          >
                            1
                          </PaginationLink>
                        </PaginationItem>
                        {currentPage > 3 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                      </>
                    )}

                    {/* Previous page */}
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(currentPage - 1);
                          }}
                          className="cursor-pointer"
                        >
                          {currentPage - 1}
                        </PaginationLink>
                      </PaginationItem>
                    )}

                    {/* Current page */}
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        isActive
                        className="cursor-pointer"
                      >
                        {currentPage}
                      </PaginationLink>
                    </PaginationItem>

                    {/* Next page */}
                    {currentPage < totalPages && (
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(currentPage + 1);
                          }}
                          className="cursor-pointer"
                        >
                          {currentPage + 1}
                        </PaginationLink>
                      </PaginationItem>
                    )}

                    {/* Last page */}
                    {currentPage < totalPages - 1 && (
                      <>
                        {currentPage < totalPages - 2 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(totalPages);
                            }}
                            className="cursor-pointer"
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) {
                            handlePageChange(currentPage + 1);
                          }
                        }}
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
