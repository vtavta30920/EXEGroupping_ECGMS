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
import { Plus, BookOpen } from "lucide-react";
import { getCurrentUser } from "@/lib/utils/auth";
import { mockCourses } from "@/lib/mock-data/courses";
import { useToast } from "@/lib/hooks/use-toast";

export default function CoursesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
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

  const lecturerCourses = mockCourses.filter(
    (c) => c.lecturerId === user.userId
  );

  return (
    <DashboardLayout role="lecturer">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Khóa học</h1>
            <p className="text-gray-600 mt-1">
              Quản lý các khóa học bạn phụ trách
            </p>
          </div>
          {/* <Button
            className="bg-orange-500 hover:bg-orange-600"
            onClick={() =>
              toast({
                title: "Tạo khóa học",
                description: "Hành động mô phỏng",
              })
            }
          >
            <Plus className="w-4 h-4 mr-2" />
            Tạo khóa học
          </Button> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lecturerCourses.map((course) => (
            <Card
              key={course.courseId}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                toast({
                  title: "Mở khóa học",
                  description: course.courseName,
                });
                router.push(`/lecturer/courses/${course.courseId}`);
              }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
                    Active
                  </span>
                </div>
                <CardTitle className="mt-4">{course.courseName}</CardTitle>
                <CardDescription>{course.courseCode}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Semester: {course.semester}</p>
                  <p>Year: {course.year}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
