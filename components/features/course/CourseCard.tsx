// components/features/course/CourseCard.tsx
// Course card component for displaying course information
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Course } from '@/lib/types'

interface CourseCardProps {
  course: Course
  onViewDetails?: (courseId: string) => void
}

export function CourseCard({ course, onViewDetails }: CourseCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onViewDetails?.(course.courseId)}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{course.courseName}</CardTitle>
            <CardDescription className="text-sm text-gray-600">
              {course.courseCode}
            </CardDescription>
          </div>
          <Badge variant="secondary">
            {course.semester} {course.year}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {course.description && (
          <p className="text-sm text-gray-700 mb-3">
            {course.description}
          </p>
        )}
        <div className="text-xs text-gray-500">
          Lecturer ID: {course.lecturerId}
        </div>
      </CardContent>
    </Card>
  )
}
