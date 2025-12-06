type DashboardData = {
  activeCourses: number
  students: { total: number; unassigned: number }
  groups: { total: number; empty: number }
  nearestDeadline: { courseCode: string; courseName: string; deadline: string }
  courseProgress: { courseCode: string; courseName: string; assigned: number; unassigned: number; totalStudents: number }[]
  attentionNeeded: {
    lowMemberGroups: { groupId: string; name: string; courseCode: string; memberCount: number; maxMembers: number }[]
    missingMentorCourses: { courseCode: string; courseName: string }[]
  }
}

export type { DashboardData }