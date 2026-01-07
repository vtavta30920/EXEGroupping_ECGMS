export type DashboardData = {
  totalCourses: number
  totalStudents: number
  totalLecturers: number
  totalGroups: number
  emptyGroups: number

  groupProgress: {
    courseCode: string
    hasGroup: number
    noGroup: number
  }[]

  warnings: {
    groupsMissingLeader: {
      groupId: string
      groupName: string
      courseCode: string
      memberCount: number
    }[]

    groupsMissingMembers: {
      groupId: string
      groupName: string
      courseCode: string
      memberCount: number
    }[]

    coursesNoMentor: {
      courseId: string
      courseCode: string
      courseName: string
    }[]
  }
}
