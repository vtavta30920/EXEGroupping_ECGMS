"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Loader2 } from "lucide-react";
import { getCurrentUser } from "@/lib/utils/auth";
import { useToast } from "@/lib/hooks/use-toast";
import { GroupService } from "@/lib/api/groupService";
import { CourseService } from "@/lib/api/courseService";
import type { Group } from "@/lib/types/group";
import type { Course } from "@/lib/types/course";
import { DashboardStatsCards } from "@/components/features/lecturer/dashboard/DashboardStatsCards";
import { RecentGroupsCard } from "@/components/features/lecturer/dashboard/RecentGroupsCard";
import { CoursesOverviewCard } from "@/components/features/lecturer/dashboard/CoursesOverviewCard";
import { SkillDistributionCard } from "@/components/features/lecturer/dashboard/SkillDistributionCard";
import { GroupsByCourseCard } from "@/components/features/lecturer/dashboard/GroupsByCourseCard";
import { ExportReportDialog } from "@/components/features/lecturer/dashboard/ExportReportDialog";

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
          <ExportReportDialog
            showExportDialog={showExportDialog}
            setShowExportDialog={setShowExportDialog}
            exportFormat={exportFormat}
            setExportFormat={setExportFormat}
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <>
            <DashboardStatsCards stats={stats} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentGroupsCard groups={groups} />
              <CoursesOverviewCard courses={courses} groups={groups} />
            </div>
            <SkillDistributionCard groups={groups} />
            <GroupsByCourseCard courses={courses} groups={groups} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
