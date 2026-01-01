"use client";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { useStudentDashboardData } from "@/components/features/student/dashboard/useStudentDashboardData";
import { DashboardHeader } from "@/components/features/student/dashboard/DashboardHeader";
import { NoGroupView } from "@/components/features/student/dashboard/NoGroupView";
import { GroupInfoCard } from "@/components/features/student/dashboard/GroupInfoCard";
import { AcademicStatusCard } from "@/components/features/student/dashboard/AcademicStatusCard";
import { UpcomingDeadlinesCard } from "@/components/features/student/dashboard/UpcomingDeadlinesCard";
import { NotificationCard } from "@/components/features/student/dashboard/NotificationCard";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const TaskStatusChart = dynamic(
  () =>
    import("@/components/features/student/dashboard/TaskStatusChart").then(
      (mod) => mod.TaskStatusChart
    ),
  {
    loading: () => <Skeleton className="h-48 w-full" />,
    ssr: false,
  }
);

export default function StudentDashboard() {
  const {
    user,
    loading,
    group,
    activeCourses,
    selectedCourseCode,
    availableGroups,
    loadingGroups,
    upcomingTasks,
    taskStats,
    gpa,
    handleCourseSelect,
    joinGroup,
  } = useStudentDashboardData();

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <DashboardHeader user={user} />

        {!loading && !group && (
          <NoGroupView
            activeCourses={activeCourses}
            selectedCourseCode={selectedCourseCode}
            loadingGroups={loadingGroups}
            availableGroups={availableGroups}
            onSelectCourse={handleCourseSelect}
            onJoinGroup={joinGroup}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GroupInfoCard loading={loading} group={group} />
          <AcademicStatusCard loading={loading} gpa={gpa} />
          <UpcomingDeadlinesCard loading={loading} tasks={upcomingTasks} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TaskStatusChart loading={loading} data={taskStats} />
          <NotificationCard />
        </div>
      </div>
    </DashboardLayout>
  );
}
