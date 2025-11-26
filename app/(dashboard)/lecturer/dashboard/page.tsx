"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import {
  Users,
  BookOpen,
  ClipboardList,
  Award,
  Download,
  TrendingUp,
  AlertTriangle,
  Calendar,
  BarChart3,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { getCurrentUser } from "@/lib/utils/auth";
import { useToast } from "@/lib/hooks/use-toast";
import { GroupService } from "@/lib/api/groupService";
import { CourseService } from "@/lib/api/courseService";
import type { Group, Course } from "@/lib/types";

interface DashboardStats {
  totalCourses: number;
  totalGroups: number;
  totalStudents: number;
  averageGroupSize: number;
  groupsWithMembers: number;
  emptyGroups: number;
}

export default function LecturerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    totalGroups: 0,
    totalStudents: 0,
    averageGroupSize: 0,
    groupsWithMembers: 0,
    emptyGroups: 0,
  });
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<"xlsx" | "csv">("xlsx");
  const { toast } = useToast();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== "lecturer") {
      router.push("/login");
      return;
    }
    setUser(currentUser);
    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load courses and groups in parallel
      const [coursesData, groupsData] = await Promise.all([
        CourseService.getCourses(),
        GroupService.getGroups(),
      ]);

      setCourses(coursesData);
      setGroups(groupsData);

      // Calculate statistics
      const totalStudents = groupsData.reduce(
        (sum, group) => sum + (group.members?.length || 0),
        0
      );
      const groupsWithMembers = groupsData.filter(
        (g) => (g.members?.length || 0) > 0
      ).length;
      const emptyGroups = groupsData.filter(
        (g) => (g.members?.length || 0) === 0
      ).length;
      const averageGroupSize =
        groupsWithMembers > 0
          ? Math.round(totalStudents / groupsWithMembers)
          : 0;

      setStats({
        totalCourses: coursesData.length,
        totalGroups: groupsData.length,
        totalStudents,
        averageGroupSize,
        groupsWithMembers,
        emptyGroups,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  // Get recent groups (sorted by createdDate, limit 5)
  const recentGroups = [...groups]
    .sort((a, b) => {
      const dateA = new Date(a.createdDate || 0).getTime();
      const dateB = new Date(b.createdDate || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

  // Get groups by course
  const groupsByCourse = courses.map((course) => ({
    course,
    groups: groups.filter((g) => g.courseId === course.courseId),
  }));

  // Calculate skill distribution from all members
  const allSkills = groups.flatMap((g) =>
    (g.members || []).flatMap((m: any) => {
      const skills: string[] = [];
      if (m.skillSet) {
        if (typeof m.skillSet === "string") {
          skills.push(m.skillSet);
        } else if (Array.isArray(m.skillSet)) {
          skills.push(...m.skillSet);
        }
      }
      return skills;
    })
  );

  const skillCount = allSkills.reduce((acc: any, skill: string) => {
    if (skill && skill.trim()) {
      acc[skill] = (acc[skill] || 0) + 1;
    }
    return acc;
  }, {});

  const maxSkillCount = Math.max(
    ...Object.values(skillCount).map((v) => (typeof v === "number" ? v : 0)),
    1
  );

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

  const handleExportReport = async () => {
    try {
      // TODO: Implement export functionality
      toast({
        title: "Đang phát triển",
        description: "Tính năng xuất báo cáo đang được phát triển",
      });
      setShowExportDialog(false);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xuất báo cáo",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout role="lecturer">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Chào mừng quay lại, {user.fullName || user.username}!
            </h1>
            <p className="text-gray-600 mt-1">
              Tổng quan về các khóa học và nhóm bạn đang phụ trách
            </p>
          </div>
          <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Xuất báo cáo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Xuất báo cáo</DialogTitle>
                <DialogDescription>
                  Chọn định dạng file để xuất báo cáo tiến độ và điểm số
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="xlsx"
                      name="format"
                      value="xlsx"
                      checked={exportFormat === "xlsx"}
                      onChange={(e) =>
                        setExportFormat(e.target.value as "xlsx" | "csv")
                      }
                      className="w-4 h-4"
                    />
                    <label htmlFor="xlsx" className="text-sm font-medium">
                      Excel (.xlsx)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="csv"
                      name="format"
                      value="csv"
                      checked={exportFormat === "csv"}
                      onChange={(e) =>
                        setExportFormat(e.target.value as "xlsx" | "csv")
                      }
                      className="w-4 h-4"
                    />
                    <label htmlFor="csv" className="text-sm font-medium">
                      CSV (.csv)
                    </label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowExportDialog(false)}
                >
                  Hủy
                </Button>
                <Button onClick={handleExportReport}>Xuất báo cáo</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Groups */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Nhóm gần đây
                      </CardTitle>
                      <CardDescription>
                        Những nhóm mới được tạo hoặc cập nhật gần nhất
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push("/lecturer/groups")}
                    >
                      Xem tất cả
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentGroups.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Chưa có nhóm nào</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentGroups.map((group) => (
                        <div
                          key={group.groupId}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() =>
                            router.push(`/lecturer/groups/${group.groupId}`)
                          }
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-gray-900">
                                {group.groupName}
                              </p>
                              {group.status && (
                                <Badge
                                  variant={
                                    group.status === "open"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {group.status}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {group.memberCount ||
                                  group.members?.length ||
                                  0}
                                /{group.maxMembers || "?"} thành viên
                              </span>
                              {group.courseName && (
                                <span className="flex items-center gap-1">
                                  <BookOpen className="w-3 h-3" />
                                  {group.courseName}
                                </span>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Courses Overview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Khóa học đang phụ trách
                      </CardTitle>
                      <CardDescription>
                        Danh sách các khóa học bạn đang giảng dạy
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {courses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Chưa có khóa học nào</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {courses.slice(0, 5).map((course) => {
                        const courseGroups = groups.filter(
                          (g) => g.courseId === course.courseId
                        );
                        const totalStudents = courseGroups.reduce(
                          (sum, g) => sum + (g.members?.length || 0),
                          0
                        );
                        return (
                          <div
                            key={course.courseId}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">
                                {course.courseName}
                              </p>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                <span>{course.courseCode}</span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {courseGroups.length} nhóm
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {totalStudents} sinh viên
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(
                                  `/lecturer/groups?course=${course.courseId}`
                                )
                              }
                            >
                              Xem
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Skill Distribution */}
            {Object.keys(skillCount).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Phân bố kỹ năng trong các nhóm
                  </CardTitle>
                  <CardDescription>
                    Heatmap thể hiện sự phân bố kỹ năng của sinh viên trong các
                    nhóm
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(skillCount)
                      .sort(
                        ([, a]: [string, any], [, b]: [string, any]) => b - a
                      )
                      .map(([skill, count]: [string, any]) => {
                        const numCount = typeof count === "number" ? count : 0;
                        const intensity = Math.min(numCount / maxSkillCount, 1);
                        const bgOpacity = 0.2 + intensity * 0.6;
                        return (
                          <Badge
                            key={skill}
                            variant="secondary"
                            style={{
                              backgroundColor: `rgba(59, 130, 246, ${bgOpacity})`,
                              borderColor: `rgba(59, 130, 246, ${0.5})`,
                            }}
                            className="px-3 py-1.5 text-sm"
                          >
                            {skill} ({numCount})
                          </Badge>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Groups by Course */}
            {groupsByCourse.filter((gbc) => gbc.groups.length > 0).length >
              0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Nhóm theo khóa học
                  </CardTitle>
                  <CardDescription>
                    Tổng quan các nhóm được phân bổ theo từng khóa học
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {groupsByCourse
                      .filter((gbc) => gbc.groups.length > 0)
                      .map(({ course, groups: courseGroups }) => {
                        const totalStudents = courseGroups.reduce(
                          (sum, g) => sum + (g.members?.length || 0),
                          0
                        );
                        const groupsWithMembers = courseGroups.filter(
                          (g) => (g.members?.length || 0) > 0
                        ).length;
                        const progress =
                          courseGroups.length > 0
                            ? Math.round(
                                (groupsWithMembers / courseGroups.length) * 100
                              )
                            : 0;

                        return (
                          <div key={course.courseId} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {course.courseName}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {courseGroups.length} nhóm • {totalStudents}{" "}
                                  sinh viên
                                </p>
                              </div>
                              <Badge variant="outline">
                                {progress}% có thành viên
                              </Badge>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
