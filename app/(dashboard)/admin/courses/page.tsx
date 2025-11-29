// app/%28dashboard%29/admin/courses/page.tsx
"use client"

import * as React from "react"
import { PlusCircle, MoreHorizontal, Trash2, Edit, Loader2 } from "lucide-react"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CourseInitializationWizard } from "@/components/features/course/CourseInitializationWizard"
import { CourseFormDialog } from "@/components/features/course/CourseFormDialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

// --- SỬA LỖI TẠI ĐÂY ---
// Import từ Adapter (lib/api/courseService), KHÔNG PHẢI generated
import { CourseService } from "@/lib/api/courseService" 
import { GroupService } from "@/lib/api/groupService"
import type { Course } from "@/lib/types"
import { getCoursesServerSide } from '@/app/(dashboard)/admin/courses/action';
import ChangeMockData from "@/components/features/ChangeMockData";
import { getCourses as getCoursesMock } from "@/lib/mock-data/courses";

export default function AdminCoursesPage() {
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingCourse, setEditingCourse] = React.useState<Course | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string>("Active");
  const { toast } = useToast();
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [impact, setImpact] = React.useState<{ groups: number; students: number } | null>(null);
  const [impactLoading, setImpactLoading] = React.useState(false);
  const [useMock, setUseMock] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('useMock');
    return saved ? saved === 'true' : true;
  });
  // Đã loại bỏ form "Tạo Khóa học mới" theo yêu cầu

  async function fetchCourses() {
    setIsLoading(true);
    try {
      const data = useMock ? await getCoursesMock() : await getCoursesServerSide();
      setCourses(data);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    fetchCourses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useMock]);

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setIsEditDialogOpen(true);
  };

  const handleDeleteCourse = (courseId: string) => {
    setDeleteId(courseId);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await CourseService.deleteCourse(deleteId);
      setCourses(prev => prev.map(c => (c.courseId === deleteId ? { ...c, status: 'Inactive' } : c)));
      toast({ title: "Đã vô hiệu hóa", description: "Khóa học đã được chuyển sang Inactive." });
    } catch (error) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể thực hiện thao tác." });
    } finally {
      setDeleteId(null);
    }
  };

  React.useEffect(() => {
    ;(async () => {
      if (!deleteId) { setImpact(null); return }
      try {
        setImpactLoading(true)
        const groups = await GroupService.getGroups(deleteId)
        const groupsCount = Array.isArray(groups) ? groups.length : 0
        const studentIds = new Set<string>()
        groups.forEach(g => {
          const ms = Array.isArray(g.members) ? g.members : []
          ms.forEach(m => { if (m?.userId) studentIds.add(String(m.userId)) })
        })
        setImpact({ groups: groupsCount, students: studentIds.size })
      } catch {
        setImpact({ groups: 0, students: 0 })
      } finally {
        setImpactLoading(false)
      }
    })()
  }, [deleteId])

  const handleUpdateCourse = async (courseData: Course) => {
     if (!editingCourse?.courseId) return;
    try {
      const updatedCourse = await CourseService.updateCourse(
          editingCourse.courseId,
          courseData
      );
      
      setCourses(courses.map((c) => (c.courseId === updatedCourse.courseId ? updatedCourse : c)));
      setIsEditDialogOpen(false);
      setEditingCourse(null);
    } catch (error) {
        console.error("Failed to update course:", error);
        alert("Cập nhật thất bại.");
    }
  };

  // Đã loại bỏ hàm tạo course trực tiếp - sử dụng Wizard để khởi tạo

  const handleInitializationComplete = (newCourses: Course[]) => {
    // Thêm khóa học mới vào danh sách (nếu Wizard trả về course đã tạo)
    // Hoặc reload lại danh sách
    setCourses(prev => [...prev, ...newCourses]);
  };

  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Khóa học</h1>
            <p className="text-gray-600 mt-1">Khởi tạo kỳ học, phân chia lớp và quản lý các khóa học.</p>
        </div>
          <div className="flex items-center gap-2">
          <Button onClick={() => setIsWizardOpen(true)}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Khởi tạo Kỳ học mới
          </Button>
          <Button
            variant="outline"
            onClick={() => setStatusFilter(statusFilter === 'Inactive' ? 'Active' : 'Inactive')}
          >
            {statusFilter === 'Inactive' ? 'Show Active Course' : 'Show Inactive Course'}
          </Button>
          </div>
        </div>
       <ChangeMockData loading={isLoading} onRefresh={fetchCourses} useMock={useMock} setUseMock={setUseMock} />
       <Card>
           <CardHeader>
             <CardTitle>Course List ({courses.length})</CardTitle>
              <div className="mt-2 w-56">
                <Label>Lọc theo trạng thái</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
           </CardHeader>
           <CardContent>
             <Table>
               <TableHeader>
                  <TableRow>
                   <TableHead>Course Code</TableHead>
                   <TableHead>Course Name</TableHead>
                   <TableHead>Description</TableHead>
                   <TableHead>Status</TableHead>
                   <TableHead>Created Date</TableHead>
                   <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                 {courses.length > 0 ? (
                   courses
                     .filter((course) => {
                       const s = normalizeCourseStatus((course as any).status);
                       return statusFilter === 'all' ? true : s === statusFilter;
                     })
                     .map((course) => (
                     <TableRow key={course.courseId ?? (course as any).id ?? `${course.courseCode}-${course.courseName}` }>
                       <TableCell className="font-medium">{course.courseCode}</TableCell>
                       <TableCell>{course.courseName}</TableCell>
                        <TableCell className="max-w-xs truncate" title={course.description}>
                           {course.description}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const s = normalizeCourseStatus((course as any).status);
                            const isActive = s === 'Active';
                            return (
                              <Badge className={isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}>
                                {s}
                              </Badge>
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const v = (course as any).createdAt ?? (course as any).createdDate ?? course.createdDate;
                            return v ? formatDate(v) : 'N/A';
                          })()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditCourse(course)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleDeleteCourse(course.courseId)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Deactivate
                                  </DropdownMenuItem>
                                </TooltipTrigger>
                                <TooltipContent>Kết thúc khóa học & Vô hiệu hóa</TooltipContent>
                              </Tooltip>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                     </TableRow>
                   ))
                 ) : (
                   <TableRow>
                     <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                       No courses yet.
                     </TableCell>
                   </TableRow>
                 )}
               </TableBody>
             </Table>
           </CardContent>
         </Card>
      </div>

      <CourseInitializationWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onComplete={handleInitializationComplete}
        existingCourses={courses}
      />
      
      {editingCourse && (
          <CourseFormDialog
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            onSave={handleUpdateCourse}
            course={editingCourse}
          />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vô hiệu hóa khóa học?</AlertDialogTitle>
            <AlertDialogDescription>
              Khóa học sẽ chuyển sang trạng thái Inactive. Các nhóm học phần trực thuộc sẽ được xử lý theo quy trình kết thúc môn.
              <br />
              {impactLoading ? (
                <span>Đang tính toán ảnh hưởng...</span>
              ) : (
                <span>
                  Ảnh hưởng: <b>{impact?.groups ?? 0}</b> nhóm • <b>{impact?.students ?? 0}</b> sinh viên sẽ được coi là hoàn thành.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Xác nhận Vô hiệu hóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}

// Helper format date to vi-VN safely
function formatDate(value: string) {
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString('vi-VN');
  } catch {
    return value;
  }
}

// Chuẩn hóa trạng thái từ API sang 'Active' | 'Inactive'
function normalizeCourseStatus(status: any): 'Active' | 'Inactive' {
  const s = (typeof status === 'string' ? status.toLowerCase() : status);
  if (s === 1 || s === '1') return 'Active';
  if (s === 0 || s === '0') return 'Inactive';
  if (s === 'active' || s === 'open') return 'Active';
  if (s === 'inactive' || s === 'closed') return 'Inactive';
  // Mặc định: nếu không rõ, coi là Active để không ẩn nhầm
  return 'Active';
}
