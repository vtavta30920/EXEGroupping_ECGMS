"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3 } from "lucide-react";
import type { Course } from "@/lib/types/course";
import type { Group } from "@/lib/types/group";

interface GroupsByCourseCardProps {
  courses: Course[];
  groups: Group[];
}

export function GroupsByCourseCard({
  courses,
  groups,
}: GroupsByCourseCardProps) {
  // Get groups by course
  const groupsByCourse = courses.map((course) => ({
    course,
    groups: groups.filter((g) => g.courseId === course.courseId),
  }));

  const filteredGroupsByCourse = groupsByCourse.filter(
    (gbc) => gbc.groups.length > 0
  );

  if (filteredGroupsByCourse.length === 0) {
    return null;
  }

  return (
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
          {filteredGroupsByCourse.map(({ course, groups: courseGroups }) => {
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
                      {courseGroups.length} nhóm • {totalStudents} sinh viên
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
  );
}

