// app/(dashboard)/admin/groups/page.tsx
"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { CourseService } from "@/lib/api/courseService"
import { TeamAllocationService } from "@/lib/api/generated"
import { GroupService as GeneratedGroupService } from "@/lib/api/generated/services/GroupService"
import { GroupService } from "@/lib/api/groupService"
// Dùng gọi trực tiếp qua BFF Proxy cho endpoint GetAllGroups
import type { Course } from "@/lib/types"
import { CreateEmptyGroupsDialog } from "@/components/features/group/CreateEmptyGroupsDialog"
import ChangeMockData from "@/components/features/ChangeMockData";
import { getCourses as getCoursesMock } from "@/lib/mock-data/courses";
// Đã bỏ ImportCard và logic XLSX tại đây; chuyển sang Dialog
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { mockUsers } from "@/lib/mock-data/auth"
import { mockGroups } from "@/lib/mock-data/groups"
import { EditGroupDialog } from "@/components/features/group/EditGroupDialog"
import { LecturerCourseService, UserService } from "@/lib/api/generated"
import { GroupMemberService as GeneratedGroupMemberService } from "@/lib/api/generated/services/GroupMemberService"
import { Badge } from "@/components/ui/badge"
import { Shuffle } from "lucide-react"

export default function AdminGroupsPage() {
  const { toast } = useToast()
  const [courses, setCourses] = React.useState<Course[]>([])
  const [selectedCourseId, setSelectedCourseId] = React.useState<string>("")
  const [selectedCourseCode, setSelectedCourseCode] = React.useState<string>("")
  const [selectedCourseName, setSelectedCourseName] = React.useState<string>("")
  const [emptyCount, setEmptyCount] = React.useState<number | null>(null)
  const [loadingCount, setLoadingCount] = React.useState(false)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [groups, setGroups] = React.useState<any[]>([])
  const [statusFilter, setStatusFilter] = React.useState<string>("all") // all | full | empty
  const [mentorFilter, setMentorFilter] = React.useState<string>("all")
  // Hydration-safe default: start with true on both server and client,
  // then read persisted value after mount to avoid mismatch.
  const [useMock, setUseMock] = React.useState<boolean>(true);
  const [courseLecturerId, setCourseLecturerId] = React.useState<string>("")
  const [courseLecturerName, setCourseLecturerName] = React.useState<string>("—")
  const [editOpen, setEditOpen] = React.useState(false)
  const [editTarget, setEditTarget] = React.useState<{ id: string; name: string; courseCode: string } | null>(null)
  const [isRandomizing, setIsRandomizing] = React.useState(false)
  const [isAllocating, setIsAllocating] = React.useState(false)
  const [lecturerNames, setLecturerNames] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('useMock');
      if (saved !== null) {
        setUseMock(saved === 'true');
      }
    } catch {}
  }, []);

  React.useEffect(() => {
    ;(async () => {
      try {
        const list = useMock ? await getCoursesMock() : await CourseService.getCourses()
        // Chỉ ẩn các course Inactive; mặc định coi thiếu status là Active
        const activeCourses = (list || []).filter(c => String(c.status || 'active').toLowerCase() !== 'inactive')
        setCourses(activeCourses)
        // Reset lựa chọn khi danh sách thay đổi
        if (activeCourses.length > 0) {
          const first = activeCourses[0]
          setSelectedCourseId(first.courseId)
          setSelectedCourseCode(first.courseCode)
          setSelectedCourseName(first.courseName)
          await loadGroups(first.courseCode)
          loadEmptyCount(first.courseCode)
          await loadCourseLecturer(first.courseId, first.courseCode)
        } else {
          // Không có course Active -> clear selection
          setSelectedCourseId("")
          setSelectedCourseCode("")
          setSelectedCourseName("")
          setGroups([])
          setEmptyCount(null)
        }
      } catch (err) {
        toast({ title: "Lỗi", description: "Không thể tải danh sách môn học." })
      }
    })()
  }, [useMock])

  const loadEmptyCount = async (courseCode: string) => {
    if (!courseCode) return
    setLoadingCount(true)
    setEmptyCount(null)
    try {
      let countEmpty = 0
      if (useMock) {
        const list = mockGroups.filter(g => g.courseCode === courseCode)
        countEmpty = list.filter(g => (g.memberCount ?? 0) === 0).length
      } else {
        const ts = Date.now()
        const res = await fetch(`/api/proxy/Group/GetGroupByCourseCode/${encodeURIComponent(courseCode)}?_t=${ts}`, {
          cache: 'no-store',
          next: { revalidate: 0 },
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        })
        if (!res.ok) {
          const text = await res.text().catch(() => '')
          throw new Error(`GetGroupByCourseCode failed: ${res.status} ${res.statusText} ${text}`)
        }
        const groups = await res.json()
        const list = Array.isArray(groups) ? groups : []
        const emptyGroups = list.filter((g: any) => ((g.countMembers ?? 0) === 0) && ((g.groupMembers?.length ?? 0) === 0) && ((g.members?.length ?? 0) === 0))
        countEmpty = emptyGroups.length
      }
      setEmptyCount(countEmpty)
      if (countEmpty === 0) {
        toast({ title: "Chưa có nhóm trống", description: `Khoá ${courseCode} chưa có nhóm trống. Hãy tạo nhóm trống.` })
      }
    } catch (err) {
      toast({ title: "Lỗi", description: "Không thể tải nhóm của môn học." })
    } finally {
      setLoadingCount(false)
    }
  }

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId)
    const c = courses.find(c => c.courseId === courseId)
    setSelectedCourseCode(c?.courseCode || "")
    setSelectedCourseName(c?.courseName || "")
    if (c?.courseCode) {
      loadGroups(c.courseCode)
      loadEmptyCount(c.courseCode)
      loadCourseLecturer(courseId, c.courseCode)
    }
  }

  const refreshEmptyCount = React.useCallback(() => {
    if (selectedCourseCode) {
      loadEmptyCount(selectedCourseCode)
    }
  }, [selectedCourseCode])

  const loadCourseLecturer = React.useCallback(async (courseId: string, courseCode: string) => {
    try {
      if (!courseId) { setCourseLecturerId(""); setCourseLecturerName("—"); return }
      if (useMock) {
        const cid = courses.find(c => c.courseId === courseId)?.lecturerId || ""
        setCourseLecturerId(cid)
        const u = mockUsers.find(u => u.userId === cid)
        setCourseLecturerName(u?.fullName || '—')
      } else {
        const mapping = await LecturerCourseService.getApiLecturerCourseByCourses({ coursesId: courseId })
        let lecturerId = ""
        if (Array.isArray(mapping) && mapping.length > 0) lecturerId = mapping[0]?.lecturerId || ""
        else if (mapping && typeof mapping === 'object') lecturerId = (mapping as any)?.lecturerId || ""
        setCourseLecturerId(lecturerId)
        let name = '—'
        if (lecturerId) {
          try {
            const user = await UserService.getApiUser1({ id: lecturerId })
            name = user?.userProfile?.fullName || user?.username || user?.email || '—'
          } catch {}
        }
        setCourseLecturerName(name)
      }
    } catch (err) {
      console.warn('Load course lecturer failed', err)
      setCourseLecturerId("")
      setCourseLecturerName('—')
    }
  }, [useMock, courses])

  // Map API group to table row
  const mapApiGroupToRow = React.useCallback((g: any) => {
    const members = Array.isArray(g.groupMembers) ? g.groupMembers : (Array.isArray(g.members) ? g.members : [])
    const memberCount = (g.countMembers ?? 0) || members.length
    const maxMembers = g.maxMembers ?? 5
    const status = g.status || (memberCount >= maxMembers ? 'finalize' : (memberCount === 0 ? 'open' : 'open'))
    const lecturerId = g.lectureId || g.lecturerId || g.course?.lecturerId || ''
    const lecturerName = courseLecturerName || '—'
    const leader = members.find((m: any) => {
      const r = String(m.role ?? m.roleInGroup ?? '').toLowerCase()
      return r === 'leader' || r === 'group leader' || m.isLeader === true
    })
    const hasLeader = !!leader || !!(g.leaderId || (g.leader?.id || ''))
    const summary = `${hasLeader ? '1 Leader' : '0 Leader'} • ${hasLeader ? Math.max(memberCount - 1, 0) : memberCount} Members`
    const isValid = hasLeader && memberCount === maxMembers
    return {
      id: g.id || g.groupId || '',
      name: g.name || g.groupName || 'Chưa đặt tên',
      courseId: g.course?.id || g.courseId || '',
      courseCode: g.course?.courseCode || g.courseCode || '',
      memberCount,
      maxMembers,
      lecturerId,
      lecturerName,
      status,
      members,
      hasLeader,
      summary,
      isValid,
    }
  }, [courseLecturerName])

  // Load groups for a course
  const loadGroups = React.useCallback(async (courseCode: string) => {
    if (!courseCode) return
    try {
      let rows: any[] = []
      if (useMock) {
        const list = mockGroups.filter(g => g.courseCode === courseCode)
        rows = list.map(g => {
          const members = Array.isArray(g.members) ? g.members : []
          const memberCount = g.memberCount ?? members.length
          const maxMembers = g.maxMembers ?? 5
          const leader = members.find((m: any) => {
            const role = (m.role || '').toLowerCase()
            return role === 'leader' || m.isLeader === true || m.role === 'Leader'
          })
          const hasLeader = !!leader
          const summary = `${hasLeader ? '1 Leader' : '0 Leader'} • ${hasLeader ? Math.max(memberCount - 1, 0) : memberCount} Members`
          const isValid = hasLeader && memberCount === maxMembers
          return {
            id: g.groupId,
            name: g.groupName,
            courseCode: g.courseCode,
            memberCount,
            maxMembers,
            lecturerName: courseLecturerName || '—',
            status: g.status || (memberCount >= maxMembers ? 'finalize' : (memberCount === 0 ? 'open' : 'open')),
            members,
            hasLeader,
            summary,
            isValid,
          }
        })
      } else {
        try {
          const ts = Date.now()
          const res = await fetch(`/api/proxy/Group/GetGroupByCourseCode/${encodeURIComponent(courseCode)}?_t=${ts}`, {
            cache: 'no-store',
            next: { revalidate: 0 },
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0',
            },
          })
          if (!res.ok) {
            const text = await res.text().catch(() => '')
            throw new Error(`GetGroupByCourseCode failed: ${res.status} ${res.statusText} ${text}`)
          }
          const groupsRaw = await res.json()
          const list = Array.isArray(groupsRaw) ? groupsRaw : []
          rows = list.map(mapApiGroupToRow)
        } catch (err) {
          const all = await GeneratedGroupService.getApiGroup()
          const list = Array.isArray(all) ? all.filter((g: any) => (g?.course?.courseCode || g?.courseCode) === courseCode) : []
          rows = list.map(mapApiGroupToRow)
        }
      }
      setGroups(rows)
    } catch (err) {
      console.error(err)
      toast({ title: "Lỗi", description: "Không thể tải danh sách nhóm." })
    }
  }, [mapApiGroupToRow, toast, useMock, courses, courseLecturerName])

  React.useEffect(() => {
    ;(async () => {
      const ids = new Set<string>()
      groups.forEach(g => { const id = g.lecturerId; if (id && !lecturerNames[id]) ids.add(id) })
      if (ids.size === 0) return
      const copy = { ...lecturerNames }
      await Promise.all(Array.from(ids).map(async id => {
        try { const u = await UserService.getApiUser1({ id }); copy[id] = u?.userProfile?.fullName || u?.username || u?.email || '—' } catch { copy[id] = '—' }
      }))
      setLecturerNames(copy)
    })()
  }, [groups])

  // Random Leader cho các nhóm có thành viên nhưng chưa có Leader
  const handleRandomizeLeaders = React.useCallback(async () => {
    const targetGroups = groups.filter(g => (g.memberCount > 0) && !g.hasLeader)

    if (targetGroups.length === 0) {
      toast({ title: "Không cần xử lý", description: "Tất cả các nhóm có thành viên đều đã có Leader." })
      return
    }

    if (!selectedCourseCode) {
      toast({ title: "Thiếu thông tin", description: "Vui lòng chọn môn học." })
      return
    }

    if (!confirm(`Tìm thấy ${targetGroups.length} nhóm chưa có Leader. Bạn có muốn chọn ngẫu nhiên không?`)) return

    setIsRandomizing(true)
    try {
      const promises = targetGroups.map(async (g) => {
        const members = Array.isArray(g.members) ? g.members : []
        if (members.length === 0) return
        const randomIndex = Math.floor(Math.random() * members.length)
        const randomMember = members[randomIndex]
        const leaderId = randomMember?.userId || randomMember?.studentId || randomMember?.id || ""
        if (!leaderId) return
        await GroupService.updateGroup(g.id, { leaderId, name: g.name })
      })
      const results = await Promise.allSettled(promises)
      const successCount = results.filter(r => r.status === 'fulfilled').length
      const failCount = results.length - successCount
      toast({ title: successCount > 0 ? "Thành công" : "Lỗi", description: successCount > 0 ? `Đã cập nhật Leader cho ${successCount}/${results.length} nhóm.` : "Không thể cập nhật leader cho các nhóm." })
      await loadGroups(selectedCourseCode)
    } catch (error) {
      console.error("Randomize leaders error:", error)
      toast({ title: "Lỗi", description: String((error as any)?.message || "Có lỗi xảy ra khi random leader.") })
    } finally {
      setIsRandomizing(false)
    }
  }, [groups, selectedCourseCode, toast, loadGroups])

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Nhóm</h1>
            <p className="text-gray-600 mt-1">Chọn môn học và quản lý nhóm trống.</p>
          </div>
        </div>
        <ChangeMockData loading={loadingCount} onRefresh={refreshEmptyCount} useMock={useMock} setUseMock={setUseMock} />
        <Card>
          <CardHeader>
            <CardTitle>Quản lý nhóm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Môn học</Label>
              <Select value={selectedCourseId} onValueChange={handleCourseChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn môn học" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(c => (
                    <SelectItem key={c.courseId} value={c.courseId}>
                      {c.courseCode} - {c.courseName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setDialogOpen(true)} disabled={!selectedCourseId}>Tạo Nhóm Trống</Button>
              <Button
                variant="secondary"
                disabled={!selectedCourseCode || isAllocating}
                onClick={async () => {
                  if (!selectedCourseCode) { toast({ title: "Thiếu thông tin", description: "Vui lòng chọn môn học." }); return }
                  setIsAllocating(true)
                  try {
                    let students: any[] = []
                    if (useMock) {
                      students = mockUsers.filter(u => u.role === 'student')
                    } else {
                      try {
                        const res = await fetch('/api/proxy/User/UserWithoutGroup', { cache: 'no-store', next: { revalidate: 0 } })
                        if (!res.ok) {
                          const text = await res.text().catch(() => '')
                          throw new Error(`UserWithoutGroup failed: ${res.status} ${res.statusText} ${text}`)
                        }
                        const data = await res.json()
                        students = Array.isArray(data) ? data : []
                      } catch (e: any) {
                        toast({ title: "Không thể phân bổ", description: e?.message || "Không thể tải danh sách sinh viên chưa có nhóm." })
                        return
                      }
                    }
                    // Xác định sinh viên đã ở bất kỳ nhóm nào của course hiện tại
                    const occupiedUserIds = new Set<string>()
                    groups.filter(g => g.courseCode === selectedCourseCode).forEach(g => {
                      const ms = Array.isArray(g.members) ? g.members : []
                      ms.forEach((m: any) => { const uid = m?.userId || m?.studentId || m?.id; if (uid) occupiedUserIds.add(String(uid)) })
                    })
                    // Ưu tiên lọc theo course nếu dữ liệu có studentCourses; nếu không, lấy tất cả từ UserWithoutGroup
                    let freeStudents = students.filter((s: any) => {
                      const uid = s?.id || s?.userId
                      const alreadyInGroup = uid ? occupiedUserIds.has(String(uid)) : false
                      const hasCourseInfo = Array.isArray(s?.studentCourses)
                      const inCourse = hasCourseInfo ? s.studentCourses.some((sc: any) => (sc?.course?.courseCode || sc?.courseCode) === selectedCourseCode || sc?.courseId === selectedCourseId) : true
                      return inCourse && !alreadyInGroup
                    })
                    // Nếu sau khi lọc theo course không có sinh viên, fallback dùng toàn bộ danh sách từ UserWithoutGroup
                    if (freeStudents.length === 0) {
                      freeStudents = students.filter((s: any) => {
                        const uid = s?.id || s?.userId
                        return uid ? !occupiedUserIds.has(String(uid)) : false
                      })
                    }
                    const targetGroups = groups.filter(g => g.courseCode === selectedCourseCode && (g.memberCount === 0))
                    if (freeStudents.length === 0 || targetGroups.length === 0) { toast({ title: "Không thể phân bổ", description: "Không có sinh viên lẻ hoặc không có nhóm cần bổ sung." }); return }
                    const majors: Record<string, any[]> = {}
                    freeStudents.forEach(s => { const m = s?.userProfile?.major?.majorCode || s?.major?.majorCode || s?.majorCode || 'OTHER'; (majors[m] ||= []).push(s) })
                    const majorKeys = Object.keys(majors)
                    const plan: Record<string, string[]> = {}
                    for (const g of targetGroups) {
                      const gid = g.id
                      plan[gid] = []
                      let current = g.memberCount || 0
                      const max = g.maxMembers || 5
                      // Vòng 1: cân bằng theo major
                      for (const mk of majorKeys) { if (current >= max) break; const s = majors[mk].pop(); if (s) { const uid = s?.user?.id || s?.userId || s?.id || s?.user?.userId || s?.studentId; if (uid) { plan[gid].push(String(uid)); current++ } } }
                      // Vòng 2: lấp đầy
                      while (current < max) { const avail = majorKeys.find(k => (majors[k]?.length ?? 0) > 0); if (!avail) break; const s = majors[avail].pop(); if (s) { const uid = s?.user?.id || s?.userId || s?.id || s?.user?.userId || s?.studentId; if (uid) { plan[gid].push(String(uid)); current++ } } }
                    }
                    for (const g of targetGroups) {
                      const ids = Array.from(new Set(plan[g.id] || []))
                      const batchSize = 5
                      for (let i = 0; i < ids.length; i += batchSize) {
                        const chunk = ids.slice(i, i + batchSize)
                        await Promise.all(chunk.map(async uid => {
                          try {
                            const existing = await GeneratedGroupMemberService.getApiGroupMember({ groupId: g.id, userId: uid })
                            if (Array.isArray(existing) && existing.length > 0) return
                          } catch {}
                          await GroupService.joinGroup(g.id, uid)
                        }))
                        await new Promise(r => setTimeout(r, 200))
                      }
                      const updated = await GroupService.getGroupById(g.id)
                      const members = Array.isArray(updated?.members) ? updated!.members : []
                      if (members.length > 0 && !g.hasLeader) {
                        const ridx = Math.floor(Math.random() * members.length)
                        const leaderId = members[ridx]?.userId || ''
                        if (leaderId) { await GroupService.updateGroup(g.id, { leaderId, name: g.name, courseId: g.courseId }) }
                      }
                    }
                    toast({ title: "Hoàn tất", description: `Đã phân bổ sinh viên cho ${targetGroups.length} nhóm.` })
                    await loadGroups(selectedCourseCode)
                    await loadEmptyCount(selectedCourseCode)
                  } catch (err: any) {
                    console.error("Allocation error:", err)
                    toast({ title: "Lỗi", description: err?.message || "Không thể chạy phân bổ tự động." })
                  } finally { setIsAllocating(false) }
                }}
              >
                Phân bổ tự động
              </Button>
              <Button 
                variant="outline" 
                onClick={handleRandomizeLeaders} 
                disabled={isRandomizing || !selectedCourseCode}
              >
                <Shuffle className="w-4 h-4 mr-2" /> Random Leader
              </Button>
            </div>

            {/* Bộ lọc */}
            <div className="flex items-center gap-4">
              <div className="w-48">
                <Label>Trạng thái</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="full">Đầy</SelectItem>
                    <SelectItem value="empty">Trống</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-64">
                <Label>Mentor</Label>
                <Select value={mentorFilter} onValueChange={setMentorFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn Mentor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {mockUsers.filter(u => u.role === 'lecturer').map(u => (
                      <SelectItem key={u.userId} value={u.userId}>{u.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Thống kê nhanh */}
            <div className="text-sm text-gray-700 flex items-center gap-4">
              <span>Tổng nhóm: {groups.length}</span>
              <span>Nhóm trống: {groups.filter(g => g.memberCount === 0).length}</span>
              {selectedCourseId && (
                <span className="text-gray-600">
                  {loadingCount
                    ? "Đang kiểm tra nhóm trống..."
                    : emptyCount === null
                      ? "Chưa kiểm tra"
                      : (emptyCount === 0
                          ? (groups.length === 0
                              ? "Chưa khởi tạo nhóm."
                              : "Tất cả các nhóm đều đã có thành viên hoạt động.")
                          : `Khoá ${selectedCourseCode} đang có ${emptyCount} nhóm trống.`)}
                </span>
              )}
            </div>

            {/* Bảng nhóm */}
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên nhóm</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Lecturer</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups
                    .filter(g => statusFilter === 'all' ? true : (statusFilter === 'full' ? g.memberCount >= g.maxMembers : g.memberCount === 0))
                    .filter(() => mentorFilter === 'all' ? true : (courseLecturerId === mentorFilter))
                    .map(g => (
                      <TableRow key={g.id}>
                        <TableCell>{g.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{g.memberCount}/{g.maxMembers}</span>
                            <span className="text-xs text-gray-500">{g.summary ?? `${g.hasLeader ? '1 Leader' : '0 Leader'} • ${(g.hasLeader ? Math.max(g.memberCount - 1, 0) : g.memberCount)} Members`}</span>
                          </div>
                        </TableCell>
                        <TableCell>{g.lecturerId ? (lecturerNames[g.lecturerId] || '—') : g.lecturerName}</TableCell>
                        <TableCell>
                          {(() => {
                            const valid = g.isValid === true || (g.hasLeader && g.memberCount === g.maxMembers)
                            const missingLeader = g.memberCount > 0 && !g.hasLeader
                            if (valid) return <Badge className="bg-green-100 text-green-700">Valid</Badge>
                            if (missingLeader) return <Badge className="bg-red-100 text-red-700">Missing Leader</Badge>
                            return <Badge className="bg-yellow-100 text-yellow-700">Open</Badge>
                          })()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const c = courses.find(c => c.courseCode === g.courseCode)
                                setEditTarget({ id: g.id, name: g.name, courseCode: g.courseCode })
                                if (c?.courseId) loadCourseLecturer(c.courseId, c.courseCode)
                                setEditOpen(true)
                              }}  
                            >
                              Sửa
                            </Button>
                            <Button variant="destructive" size="sm">Xóa</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Hai card import Excel đã được gỡ bỏ. Chức năng import chuyển sang dialog Tạo Nhóm Trống. */}

        <CreateEmptyGroupsDialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSuccess={() => {
            setDialogOpen(false)
            if (selectedCourseCode) {
              loadGroups(selectedCourseCode)
              loadEmptyCount(selectedCourseCode)
            }
          }}
          initialCourseId={selectedCourseId}
          initialCourseCode={selectedCourseCode}
        />

        <EditGroupDialog
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          groupId={editTarget?.id || ''}
          groupName={editTarget?.name || ''}
          courseId={selectedCourseId}
          courseCode={selectedCourseCode}
          useMock={useMock}
          onSuccess={(newLecturerId) => {
            setEditOpen(false)
            if (useMock) {
              setCourses(prev => prev.map(c => c.courseId === selectedCourseId ? { ...c, lecturerId: newLecturerId } : c))
            }
            loadCourseLecturer(selectedCourseId, selectedCourseCode)
            if (selectedCourseCode) {
              loadGroups(selectedCourseCode)
            }
          }}
        />
      </div>
    </DashboardLayout>
  )
}
