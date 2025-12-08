export type LecturerCourseDetail = {
  courseId: string
  lecturerId: string
  course: {
    id: string
    courseName: string
    courseCode: string
    description: string
    status: string
    maxGroupSize: number
    createdAt: string
    updatedAt: string
  }
  lecturer: {
    username: string
    fullname: string | null
  }
}
