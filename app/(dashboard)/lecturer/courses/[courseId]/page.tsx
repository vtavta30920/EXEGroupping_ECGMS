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
import { ArrowLeft, Users, Calendar, BookOpen } from "lucide-react";
import { getCurrentUser } from "@/lib/utils/auth";
import { mockCourses } from "@/lib/mock-data/courses";
import { mockGroups } from "@/lib/mock-data/groups";
import { useToast } from "@/lib/hooks/use-toast";

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [courseGroups, setCourseGroups] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== "lecturer") {
      router.push("/login");
      return;
    }
    setUser(currentUser);

    // Find course
    const courseId = params.courseId as string;
    const foundCourse = mockCourses.find((c) => c.courseId === courseId);

    if (!foundCourse) {
      toast({ title: "Error", description: "Course not found" });
      router.push("/lecturer/courses");
      return;
    }

    // Check if lecturer teaches this course
    if (foundCourse.lecturerId !== currentUser.userId) {
      toast({
        title: "Access Denied",
        description: "You don't teach this course",
      });
      router.push("/lecturer/courses");
      return;
    }

    setCourse(foundCourse);

    // Find groups for this course
    const groups = mockGroups.filter((g) => g.courseId === courseId);
    setCourseGroups(groups);
  }, [router, params.courseId, toast]);

  if (!user || !course) return null;

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getApprovalStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Đã duyệt";
      case "rejected":
        return "Từ chối";
      case "pending":
        return "Chờ duyệt";
      default:
        return "Không xác định";
    }
  };

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
                              {group.groupName}
                            </h3>
                            <Badge
                              className={getApprovalStatusColor(
                                group.approvalStatus
                              )}
                            >
                              {getApprovalStatusText(group.approvalStatus)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Thành viên</p>
                              <p className="font-semibold">
                                {group.memberCount}/{group.maxMembers}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Trưởng nhóm</p>
                              <p className="font-semibold">
                                {group.leaderName}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Chuyên ngành</p>
                              <div className="flex gap-1">
                                {group.majors.map((major: string) => (
                                  <Badge
                                    key={major}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {major}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-600">Ngày tạo</p>
                              <p className="font-semibold">
                                {group.createdDate}
                              </p>
                            </div>
                          </div>
                          {group.rejectionReason && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                              <p className="text-sm text-red-700">
                                <strong>Lý do từ chối:</strong>{" "}
                                {group.rejectionReason}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Xem chi tiết",
                                description: group.groupName,
                              });
                              router.push(`/lecturer/groups/${group.groupId}`);
                            }}
                          >
                            Xem chi tiết
                          </Button>
                          {group.approvalStatus === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => {
                                  toast({
                                    title: "Phê duyệt nhóm",
                                    description: `Đã phê duyệt ${group.groupName}`,
                                  });
                                }}
                              >
                                Duyệt
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  toast({
                                    title: "Từ chối nhóm",
                                    description: `Từ chối ${group.groupName}`,
                                  });
                                }}
                              >
                                Từ chối
                              </Button>
                            </>
                          )}
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
