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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCurrentUser } from "@/lib/utils/auth";
import { mockTasks } from "@/lib/mock-data/tasks";
import { mockCheckpoints } from "@/lib/mock-data/checkpoints";
import { mockCourses } from "@/lib/mock-data/courses";
import { mockGroups } from "@/lib/mock-data/groups";
import { useToast } from "@/lib/hooks/use-toast";
import type {
  CheckpointGrade,
  CourseFinalGrade,
  Checkpoint,
  Task,
  Course,
  Group,
} from "@/lib/types";
import {
  Award,
  TrendingUp,
  BookOpen,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function GradesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(
    new Set()
  );
  const { toast } = useToast();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== "lecturer") {
      router.push("/login");
      return;
    }
    setUser(currentUser);
  }, [router]);

  if (!user) return null;

  // Filter data for the signed-in lecturer - memoized
  const lecturerCourses = useMemo(
    () => mockCourses.filter((c) => c.lecturerId === user.userId),
    [user.userId]
  );

  const lecturerCourseIds = useMemo(
    () => new Set(lecturerCourses.map((c) => c.courseId)),
    [lecturerCourses]
  );

  const lecturerGroups = useMemo(
    () => mockGroups.filter((g) => lecturerCourseIds.has(g.courseId)),
    [lecturerCourseIds]
  );

  const lecturerCheckpoints = useMemo(
    () => mockCheckpoints.filter((cp) => lecturerCourseIds.has(cp.courseId)),
    [lecturerCourseIds]
  );

  // Get tasks for lecturer's groups - memoized
  const lecturerGroupIds = useMemo(
    () => new Set(lecturerGroups.map((g) => g.groupId)),
    [lecturerGroups]
  );

  const lecturerTasks = useMemo(
    () => mockTasks.filter((t) => lecturerGroupIds.has(t.groupId)),
    [lecturerGroupIds]
  );

  const toggleCourse = useCallback((courseId: string) => {
    setExpandedCourses((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(courseId)) {
        newExpanded.delete(courseId);
      } else {
        newExpanded.add(courseId);
      }
      return newExpanded;
    });
  }, []);

  // Calculate checkpoint grades for each group - memoized
  const calculateCheckpointGrades = useCallback(
    (
      groupId: string,
      courseId: string,
      checkpoints: Checkpoint[],
      tasks: Task[]
    ): CheckpointGrade[] => {
      const courseCheckpoints = checkpoints.filter(
        (cp) => cp.courseId === courseId
      );
      const groupTasks = tasks.filter((t) => t.groupId === groupId);

      return courseCheckpoints.map((checkpoint) => {
        const checkpointTasks = groupTasks.filter(
          (t) =>
            t.checkpointId === checkpoint.checkpointId && t.status === "graded"
        );
        const taskGrades = checkpointTasks
          .map((t) => t.grade || 0)
          .filter((grade) => grade > 0);
        const averageGrade =
          taskGrades.length > 0
            ? taskGrades.reduce((sum, grade) => sum + grade, 0) /
              taskGrades.length
            : 0;
        const weightedScore = (averageGrade * checkpoint.weight) / 100;

        return {
          checkpointId: checkpoint.checkpointId,
          checkpointNumber: checkpoint.checkpointNumber,
          checkpointName: checkpoint.checkpointName,
          groupId,
          groupName: "",
          taskGrades,
          averageGrade: Math.round(averageGrade * 100) / 100,
          weight: checkpoint.weight,
          weightedScore: Math.round(weightedScore * 100) / 100,
        };
      });
    },
    []
  );

  // Calculate final course grades - memoized
  const courseFinalGrades = useMemo(() => {
    const result: CourseFinalGrade[] = [];

    lecturerCourses.forEach((course) => {
      const courseGroups = lecturerGroups.filter(
        (g) => g.courseId === course.courseId
      );

      courseGroups.forEach((group) => {
        const checkpointGrades = calculateCheckpointGrades(
          group.groupId,
          course.courseId,
          lecturerCheckpoints,
          lecturerTasks
        );
        const finalGrade = checkpointGrades.reduce(
          (sum, cg) => sum + cg.weightedScore,
          0
        );

        result.push({
          courseId: course.courseId,
          courseCode: course.courseCode,
          courseName: course.courseName,
          groupId: group.groupId,
          groupName: group.groupName,
          checkpointGrades: checkpointGrades.map((cg) => ({
            ...cg,
            groupName: group.groupName,
          })),
          finalGrade: Math.round(finalGrade * 100) / 100,
        });
      });
    });

    return result;
  }, [
    lecturerCourses,
    lecturerGroups,
    lecturerCheckpoints,
    lecturerTasks,
    calculateCheckpointGrades,
  ]);

  // Group final grades by course - memoized
  const gradesByCourse = useMemo(
    () =>
      lecturerCourses.reduce((acc, course) => {
        const grades = courseFinalGrades.filter(
          (g) => g.courseId === course.courseId
        );
        if (grades.length > 0) {
          acc[course.courseId] = {
            course,
            grades,
          };
        }
        return acc;
      }, {} as Record<string, { course: Course; grades: CourseFinalGrade[] }>),
    [lecturerCourses, courseFinalGrades]
  );

  const getGradeColor = (grade: number) => {
    if (grade >= 80) return "text-green-600";
    if (grade >= 65) return "text-blue-600";
    if (grade >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getGradeBadgeColor = (grade: number) => {
    if (grade >= 80) return "bg-green-100 text-green-700";
    if (grade >= 65) return "bg-blue-100 text-blue-700";
    if (grade >= 50) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  // Calculate statistics - memoized
  const totalGroups = useMemo(() => lecturerGroups.length, [lecturerGroups]);
  const totalTasks = useMemo(() => lecturerTasks.length, [lecturerTasks]);
  const gradedTasks = useMemo(
    () => lecturerTasks.filter((t) => t.status === "graded").length,
    [lecturerTasks]
  );
  const averageFinalGrade = useMemo(
    () =>
      courseFinalGrades.length > 0
        ? Math.round(
            (courseFinalGrades.reduce((sum, g) => sum + g.finalGrade, 0) /
              courseFinalGrades.length) *
              100
          ) / 100
        : 0,
    [courseFinalGrades]
  );

  return (
    <DashboardLayout role="lecturer">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý Điểm số theo Checkpoint
            </h1>
            <p className="text-gray-600 mt-1">
              Xem và quản lý điểm số của các nhóm theo từng Checkpoint
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Tổng số nhóm
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {totalGroups}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Task đã chấm
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {gradedTasks}/{totalTasks}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Điểm TB cuối kỳ
                  </p>
                  <p
                    className={`text-3xl font-bold mt-2 ${getGradeColor(
                      averageFinalGrade
                    )}`}
                  >
                    {averageFinalGrade.toFixed(1)}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Số môn học
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {lecturerCourses.length}
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <BookOpen className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Grades */}
        <div className="space-y-4">
          {Object.entries(gradesByCourse)
            .sort(([, a], [, b]) =>
              a.course.courseCode.localeCompare(b.course.courseCode)
            )
            .map(([courseId, { course, grades }]) => {
              const isExpanded = expandedCourses.has(courseId);
              const courseAverage =
                grades.length > 0
                  ? Math.round(
                      (grades.reduce((sum, g) => sum + g.finalGrade, 0) /
                        grades.length) *
                        100
                    ) / 100
                  : 0;

              return (
                <Card key={courseId} className="overflow-hidden">
                  <CardHeader
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleCourse(courseId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                          <CardTitle className="text-xl">
                            {course.courseCode} - {course.courseName}
                          </CardTitle>
                          <Badge variant="outline">{grades.length} nhóm</Badge>
                        </div>
                        <CardDescription className="mt-2 ml-8">
                          {course.semester} {course.year}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Điểm TB môn</p>
                        <p
                          className={`text-2xl font-bold ${getGradeColor(
                            courseAverage
                          )}`}
                        >
                          {courseAverage.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent>
                      <div className="space-y-6">
                        {grades.map((grade) => (
                          <Card
                            key={grade.groupId}
                            className="border-l-4 border-l-blue-500"
                          >
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">
                                  {grade.groupName}
                                </CardTitle>
                                <Badge
                                  className={getGradeBadgeColor(
                                    grade.finalGrade
                                  )}
                                >
                                  Điểm cuối: {grade.finalGrade.toFixed(1)}/100
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {/* Checkpoint Grades Table */}
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Checkpoint</TableHead>
                                      <TableHead className="text-center">
                                        Số Task
                                      </TableHead>
                                      <TableHead className="text-center">
                                        Điểm TB Task
                                      </TableHead>
                                      <TableHead className="text-center">
                                        Trọng số
                                      </TableHead>
                                      <TableHead className="text-center">
                                        Điểm quy đổi
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {grade.checkpointGrades
                                      .sort(
                                        (a, b) =>
                                          a.checkpointNumber -
                                          b.checkpointNumber
                                      )
                                      .map((cg) => (
                                        <TableRow key={cg.checkpointId}>
                                          <TableCell className="font-medium">
                                            {cg.checkpointName}
                                          </TableCell>
                                          <TableCell className="text-center">
                                            {cg.taskGrades.length}
                                          </TableCell>
                                          <TableCell
                                            className={`text-center font-semibold ${getGradeColor(
                                              cg.averageGrade
                                            )}`}
                                          >
                                            {cg.averageGrade > 0
                                              ? cg.averageGrade.toFixed(1)
                                              : "-"}
                                          </TableCell>
                                          <TableCell className="text-center">
                                            {cg.weight}%
                                          </TableCell>
                                          <TableCell
                                            className={`text-center font-semibold ${getGradeColor(
                                              cg.weightedScore
                                            )}`}
                                          >
                                            {cg.weightedScore > 0
                                              ? cg.weightedScore.toFixed(1)
                                              : "-"}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    <TableRow className="bg-gray-50 font-bold">
                                      <TableCell>Tổng điểm môn học</TableCell>
                                      <TableCell></TableCell>
                                      <TableCell></TableCell>
                                      <TableCell className="text-center">
                                        100%
                                      </TableCell>
                                      <TableCell
                                        className={`text-center ${getGradeColor(
                                          grade.finalGrade
                                        )}`}
                                      >
                                        {grade.finalGrade.toFixed(1)}/100
                                      </TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>

                                {/* Progress Visualization */}
                                <div className="space-y-2">
                                  <p className="text-sm font-medium text-gray-700">
                                    Tiến độ chấm điểm theo Checkpoint:
                                  </p>
                                  {grade.checkpointGrades
                                    .sort(
                                      (a, b) =>
                                        a.checkpointNumber - b.checkpointNumber
                                    )
                                    .map((cg) => (
                                      <div
                                        key={cg.checkpointId}
                                        className="space-y-1"
                                      >
                                        <div className="flex justify-between text-sm">
                                          <span className="text-gray-600">
                                            {cg.checkpointName}
                                          </span>
                                          <span
                                            className={`font-semibold ${getGradeColor(
                                              cg.averageGrade
                                            )}`}
                                          >
                                            {cg.averageGrade > 0
                                              ? `${cg.averageGrade.toFixed(
                                                  1
                                                )}/100`
                                              : "Chưa chấm"}
                                          </span>
                                        </div>
                                        <Progress
                                          value={cg.averageGrade}
                                          className="h-2"
                                        />
                                      </div>
                                    ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Award className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Cách tính điểm:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    • Điểm Checkpoint = Trung bình cộng của tất cả điểm Task
                    trong Checkpoint đó
                  </li>
                  <li>• Mỗi Checkpoint chiếm 25% tổng điểm môn học</li>
                  <li>
                    • Điểm môn học cuối cùng = Tổng của 4 điểm Checkpoint (mỗi
                    checkpoint đã được quy đổi theo trọng số)
                  </li>
                  <li>
                    • Điểm Task được áp dụng chung cho tất cả thành viên trong
                    nhóm
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
