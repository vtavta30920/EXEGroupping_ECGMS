import type { DashboardData } from "@/lib/types/dashboard"
import type { UserStatsViewModel } from "../api/generated/models/UserStatsViewModel"

export function mapDashboardData(
  courses: any[],
  groups: any[],
  userStats: UserStatsViewModel
): DashboardData {

  // Normalize course status
  const normalizeStatus = (s: any): string => {
    const v = typeof s === "string" ? s.toLowerCase() : s
    if (v === 0 || v === "0" || v === "inactive" || v === "closed") return "Inactive"
    return "Active"
  }

  // Active courses
  const activeCoursesList = (courses ?? []).filter(
    (c) => normalizeStatus(c.status) !== "Inactive"
  )

  // Group counts
  const totalGroups = groups?.length ?? 0
  const emptyGroups = groups?.filter((g) => (g.memberCount || 0) === 0).length ?? 0

  // Student stats
  const totalStudents = userStats.totalStudents ?? 0
  const totalLecturers = userStats.totalLecturers ?? 0

  // Build groupProgress
  const progressMap: Record<string, { courseCode: string; hasGroup: number; noGroup: number }> = {}

  activeCoursesList.forEach((c: any) => {
    progressMap[c.courseCode] = { courseCode: c.courseCode, hasGroup: 0, noGroup: 0 }
  })

  groups?.forEach((g: any) => {
    const code = g.courseCode
    if (!progressMap[code]) return

    if ((g.memberCount || 0) === 0) progressMap[code].noGroup++
    else progressMap[code].hasGroup++
  })

  const groupProgress = Object.values(progressMap)

  // Warnings
  const groupsMissingMembers =
    groups
      ?.filter(
        (g: any) =>
          (g.memberCount || 0) > 0 &&
          (g.memberCount || 0) < (g.maxMembers || 5)
      )
      ?.map((g: any) => ({
        groupId: g.groupId,
        groupName: g.groupName,
        courseCode: g.courseCode,
        memberCount: g.memberCount,
      })) ?? []

  // groupsMissingLeader chưa có dữ liệu từ API FE → để trống
  const groupsMissingLeader: any[] = []

  // coursesNoMentor chưa có API → để trống
  const coursesNoMentor: any[] = []

  // ❤️ Return đúng type API BE & FE đang dùng
  return {
    totalCourses: activeCoursesList.length,
    totalStudents,
    totalLecturers,
    totalGroups,
    emptyGroups,

    groupProgress,

    warnings: {
      groupsMissingLeader,
      groupsMissingMembers,
      coursesNoMentor,
    },
  }
}
