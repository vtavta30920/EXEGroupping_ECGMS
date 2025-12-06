import type { DashboardData } from "@/lib/types/dashboard"
import type { UserStatsViewModel } from "../api/generated/models/UserStatsViewModel"

export function mapDashboardData(
  courses: any[],
  groups: any[],
  userStats: UserStatsViewModel
): DashboardData {

  // 🔹 Chuẩn hóa status của course
  const normalizeStatus = (s: any): string => {
    const v = typeof s === "string" ? s.toLowerCase() : s
    if (v === 0 || v === "0" || v === "inactive" || v === "closed") return "Inactive"
    return "Active"
  }

  // 🔹 Lọc courses đang active
  const activeCoursesList = (courses ?? []).filter(
    (c) => normalizeStatus(c.status) !== "Inactive"
  )

  // 🔹 Số group & nhóm rỗng
  const totalGroups = groups?.length ?? 0
  const emptyGroups = groups?.filter((g) => (g.memberCount || 0) === 0).length ?? 0

  // 🔹 Stats từ backend
  const totalStudents = userStats.totalStudents ?? 0
  // const unassignedStudents = userStats.unassignedStudents ?? 0

  // 🔹 Chuẩn bị chart progress
  const chartMap: Record<string, { courseCode: string; full: number; empty: number }> = {}

  activeCoursesList.forEach((c: any) => {
    chartMap[c.courseCode] = { courseCode: c.courseCode, full: 0, empty: 0 }
  })

  groups?.forEach((g: any) => {
    const code = g.courseCode
    if (!chartMap[code]) return

    if ((g.memberCount || 0) === 0) chartMap[code].empty++
    else chartMap[code].full++
  })

  const courseProgress = Object.values(chartMap).map((x) => ({
    courseCode: x.courseCode,
    courseName: x.courseCode,
    assigned: x.full,
    unassigned: x.empty,
    totalStudents: 0, // Có thể cập nhật sau
  }))

  // 🔹 Giả deadline (FE đang cần)
  const nearestDeadline = {
    courseCode: activeCoursesList[0]?.courseCode || "",
    courseName: activeCoursesList[0]?.courseName || "",
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }

  // 🔹 Cảnh báo nhóm thiếu người
  const lowMemberGroups =
    groups
      ?.filter(
        (g: any) =>
          (g.memberCount || 0) > 0 &&
          (g.memberCount || 0) < (g.maxMembers || 5)
      )
      ?.slice(0, 5)
      ?.map((g: any) => ({
        groupId: g.groupId,
        name: g.groupName,
        courseCode: g.courseCode,
        memberCount: g.memberCount,
        maxMembers: g.maxMembers,
      })) ?? []

  return {
    activeCourses: activeCoursesList.length,

    students: {
      total: totalStudents,
      unassigned: 0, // Có thể cập nhật sau
    },

    groups: {
      total: totalGroups,
      empty: emptyGroups,
    },

    nearestDeadline,
    courseProgress,

    attentionNeeded: {
      lowMemberGroups,
      missingMentorCourses: [], // sẽ thêm từ API sau
    },
  }
}
