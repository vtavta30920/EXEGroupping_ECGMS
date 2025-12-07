"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { ArrowLeft, Users, BookOpen, Loader2 } from "lucide-react";
import { getCurrentUser } from "@/lib/utils/auth";
import { CourseService } from "@/lib/api/courseService";
import { GroupService, type ApiGroup } from "@/lib/api/groupService";
import { useToast } from "@/lib/hooks/use-toast";
import type { Course } from "@/lib/types/course";

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<any>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [courseGroups, setCourseGroups] = useState<ApiGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== "lecturer") {
      router.push("/login");
      return;
    }
    setUser(currentUser);
    loadCourseData(currentUser.userId);
  }, [router, params.courseId]);

  const loadCourseData = async (lecturerId: string) => {
    try {
      setLoading(true);
      const courseId = params.courseId as string;

      // Load course
      const foundCourse = await CourseService.getCourseById(courseId);
      if (!foundCourse) {
        toast({
          title: "Lỗi",
          description: "Không tìm thấy khóa học",
          variant: "destructive",
        });
        router.push("/lecturer/courses");
        return;
      }

      // Verify lecturer teaches this course
      const lecturerCourses = await CourseService.getCoursesByLecturer(
        lecturerId
      );
      const hasAccess = lecturerCourses.some((c) => c.courseId === courseId);

      if (!hasAccess) {
        toast({
          title: "Truy cập bị từ chối",
          description: "Bạn không phụ trách khóa học này",
          variant: "destructive",
        });
        router.push("/lecturer/courses");
        return;
      }

      setCourse(foundCourse);

      // Load groups for this course
      const allGroups = await GroupService.getGroups();
      const groups = allGroups.filter((g) => g.courseId === courseId);
      setCourseGroups(groups);
    } catch (error) {
      console.error("Error loading course data:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu khóa học",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <DashboardLayout role="lecturer">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!course) return null;

  return (
    <DashboardLayout role="lecturer">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/lecturer/courses")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {course.courseName}
            </h1>
            <p className="text-gray-600 mt-1">{course.courseCode}</p>
          </div>
        </div>

        {/* Course Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Thông tin khóa học
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Học kỳ</p>
                <p className="font-semibold">{course.semester}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Năm học</p>
                <p className="font-semibold">{course.year}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Số nhóm</p>
                <p className="font-semibold">{courseGroups.length}</p>
              </div>
            </div>
            {course.description && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">Mô tả</p>
                <p className="text-sm">{course.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Groups List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Danh sách nhóm sinh viên
            </CardTitle>
            <CardDescription>
              Quản lý và phê duyệt các nhóm trong khóa học này
            </CardDescription>
          </CardHeader>
          <CardContent>
            {courseGroups.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Chưa có nhóm nào trong khóa học này
              </div>
            ) : (
              <div className="space-y-4">
                {courseGroups.map((group) => (
                  <Card
                    key={group.groupId}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">
                              {group.name}
                            </h3>
                            {group.status && (
                              <Badge
                                variant={
                                  group.status === "active"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {group.status}
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Thành viên</p>
                              <p className="font-semibold">
                                {group.members?.length || 0}/
                                {group.maxMembers || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Trưởng nhóm</p>
                              <p className="font-semibold">
                                {group.members?.[0]?.userProfileViewModel
                                  ?.fullName || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Chuyên ngành</p>
                              <div className="flex gap-1 flex-wrap">
                                {group.members
                                  ?.slice(0, 3)
                                  .map((member: any, idx: number) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {member.majorCode || "N/A"}
                                    </Badge>
                                  ))}
                                {group.members && group.members.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{group.members.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-600">Trạng thái</p>
                              <Badge
                                variant={
                                  group.status === "active"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {group.status || "N/A"}
                              </Badge>
                            </div>
                          </div>
                          {group.topicName && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">
                                <strong>Chủ đề:</strong> {group.topicName}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              router.push(`/lecturer/groups/${group.groupId}`);
                            }}
                          >
                            Xem chi tiết
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
