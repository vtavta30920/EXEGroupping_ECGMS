"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen } from "lucide-react";
import type { Course } from "@/lib/types/course";
import type { Group } from "@/lib/types/group";

interface CoursesOverviewCardProps {
  courses: Course[];
  groups: Group[];
}

export function CoursesOverviewCard({
  courses,
  groups,
}: CoursesOverviewCardProps) {
  const router = useRouter();

  return (
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
  );
}

