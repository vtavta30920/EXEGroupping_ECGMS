"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { getCurrentUser, updateCurrentUser } from "@/lib/utils/auth"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, GraduationCap, Calendar, AlertTriangle } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { GroupService } from "@/lib/api/groupService"
import { TaskService } from "@/lib/api/taskService"
import { CourseService } from "@/lib/api/courseService"
import { mockGradeItems, mockGrades } from "@/lib/mock-data/grades"
import type { User, Task } from "@/lib/types"

function getUpcomingTasks(tasks: Task[], userId: string) {
  const today = new Date()
  return tasks
    .filter(t => t.assignedToId === userId && t.status !== 'graded')
    .filter(t => new Date(t.dueDate) >= today)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3)
}

export default function StudentDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [group, setGroup] = useState<any | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeCourses, setActiveCourses] = useState<any[]>([])
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>("")
  const [availableGroups, setAvailableGroups] = useState<any[]>([])
  const [loadingGroups, setLoadingGroups] = useState(false)

  useEffect(() => {
    const currentUser = getCurrentUser() as User | null
    if (!currentUser || currentUser.role !== "student") { router.push("/login"); return }
    setUser(currentUser)

    // Listen for user state changes (join/leave group)
    const handleUserStateChange = () => {
      const updatedUser = getCurrentUser() as User | null
      setUser(updatedUser)
      console.log("📡 [Dashboard] User state updated:", updatedUser?.groupId)
    }

    window.addEventListener('userStateChanged', handleUserStateChange)
    return () => window.removeEventListener('userStateChanged', handleUserStateChange)
    ;(async () => {
      try {
        // Always try to get latest group info from API for students
        console.log('[Dashboard] Fetching latest group info for userId:', currentUser!.userId);
        let groupData = null;
        try {
          groupData = await GroupService.getGroupByStudentId(currentUser!.userId);
          console.log('[Dashboard] Group data from API:', groupData);
        } catch (apiError) {
          console.warn('[Dashboard] Could not fetch group from API:', apiError);
          // Fallback to stored groupId
          if (currentUser!.groupId) {
            try {
              groupData = await GroupService.getGroupById(String(currentUser!.groupId));
              console.log('[Dashboard] Group data from stored groupId:', groupData);
            } catch (fallbackError) {
              console.warn('[Dashboard] Could not fetch group from stored groupId:', fallbackError);
            }
          }
        }

        if (groupData) {
          // User has a group
          setGroup(groupData);
          const ts = await TaskService.getTasksByGroupId(String(groupData.groupId));
          setTasks(ts);
          setActiveCourses([]); // Clear courses when user has group

          // Update user data if groupId changed
          if (groupData.groupId !== currentUser!.groupId) {
            console.log('[Dashboard] Updating user groupId:', currentUser!.groupId, '→', groupData.groupId);
            const updatedUser = { ...currentUser!, groupId: groupData.groupId };
            updateCurrentUser(updatedUser);
          }
        } else {
          // User doesn't have a group
          const courses = await CourseService.getCourses()
          const list = (Array.isArray(courses) ? courses : []).filter(c => String((c as any).status || '').toLowerCase() !== 'inactive')
          setActiveCourses(list)
          setGroup(null)
          setTasks([])

          // Auto-select first course and load groups so dashboard shows available groups immediately
          if (list.length > 0) {
            const firstCode = list[0].courseCode || ''
            setSelectedCourseCode(firstCode)
            setLoadingGroups(true)
            try {
              const res = await fetch(`/api/proxy/Group/GetAllGroups?CourseCode=${encodeURIComponent((firstCode || '').toLowerCase())}`, { cache: 'no-store' })
              if (res.ok) {
                const data = await res.json()
                const list = Array.isArray(data) ? data : []
                const normalized = list.map((d: any) => ({
                  groupId: d.groupId || d.id || d.Id || d.GroupId || d.groupID || d.GroupID || '',
                  name: d.name || d.groupName || d.group_name || d.GroupName || d.groupName || '',
                  memberCount: (d.countMembers ?? d.memberCount ?? (Array.isArray(d.members) ? d.members.length : undefined)) || 0,
                  raw: d,
                }))
                setAvailableGroups(normalized)
              } else {
                console.warn('Failed to load groups for course', firstCode, res.status)
                setAvailableGroups([])
              }
            } catch (err) {
              console.error('Error loading groups:', err)
              setAvailableGroups([])
            } finally {
              setLoadingGroups(false)
            }
          }
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [router])

  // Reload data when user changes (after join/leave group)
  useEffect(() => {
    if (!user) return

    const reloadData = async () => {
      try {
        setLoading(true)

        // Always try to get latest group info from API
        console.log('[Dashboard] Reloading data for userId:', user.userId);
        let groupData = null;
        try {
          groupData = await GroupService.getGroupByStudentId(user.userId);
          console.log('[Dashboard] Reload group data from API:', groupData);
        } catch (apiError) {
          console.warn('[Dashboard] Could not fetch group from API:', apiError);
          // Fallback to stored groupId
          if (user.groupId) {
            try {
              groupData = await GroupService.getGroupById(String(user.groupId));
              console.log('[Dashboard] Reload group data from stored groupId:', groupData);
            } catch (fallbackError) {
              console.warn('[Dashboard] Could not fetch group from stored groupId:', fallbackError);
            }
          }
        }

        if (groupData) {
          setGroup(groupData);
          const ts = await TaskService.getTasksByGroupId(String(groupData.groupId));
          setTasks(ts);
          setActiveCourses([]);
        } else {
          const courses = await CourseService.getCourses()
          const list = (Array.isArray(courses) ? courses : []).filter(c => String((c as any).status || '').toLowerCase() !== 'inactive')
          setActiveCourses(list)
          setGroup(null)
          setTasks([])

          // Auto-select first course and load groups on reload as well
          if (list.length > 0) {
            const firstCode = list[0].courseCode || ''
            setSelectedCourseCode(firstCode)
            setLoadingGroups(true)
            try {
              const res = await fetch(`/api/proxy/Group/GetAllGroups?CourseCode=${encodeURIComponent((firstCode || '').toLowerCase())}`, { cache: 'no-store' })
              if (res.ok) {
                const data = await res.json()
                const list2 = Array.isArray(data) ? data : []
                const normalized = list2.map((d: any) => ({
                  groupId: d.groupId || d.id || d.Id || d.GroupId || d.groupID || d.GroupID || '',
                  name: d.name || d.groupName || d.group_name || d.GroupName || d.groupName || '',
                  memberCount: (d.countMembers ?? d.memberCount ?? (Array.isArray(d.members) ? d.members.length : undefined)) || 0,
                  raw: d,
                }))
                setAvailableGroups(normalized)
              } else {
                console.warn('Failed to load groups for course', firstCode, res.status)
                setAvailableGroups([])
              }
            } catch (err) {
              console.error('Error loading groups:', err)
              setAvailableGroups([])
            } finally {
              setLoadingGroups(false)
            }
          }
        }
      } finally {
        setLoading(false)
      }
    }

    reloadData()
  }, [user])

  const upcoming = useMemo(() => user ? getUpcomingTasks(tasks, user.userId) : [], [tasks, user])
  const statusChart = useMemo(() => {
    const me = tasks.filter(t => t.assignedToId === (user?.userId || ''))
    const pending = me.filter(t => t.status === 'pending').length
    const inprogress = me.filter(t => t.status === 'in-progress').length
    const completed = me.filter(t => t.status === 'graded').length
    return [
      { name: 'Pending', value: pending },
      { name: 'In Progress', value: inprogress },
      { name: 'Done', value: completed },
    ]
  }, [tasks, user])

  const gpa = useMemo(() => {
    if (!user) return 0
    const individual = mockGrades.filter(g => g.studentId === user.userId)
    if (individual.length === 0) return 0
    const avg = individual.reduce((s, g) => s + (g.score || 0), 0) / individual.length
    return Math.round(avg * 100) / 100
  }, [user])

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Xin chào, {user?.fullName || 'Sinh viên'}!</h1>
            <p className="text-gray-600 mt-1">Trang tổng quan học tập và dự án</p>
          </div>
        </div>

        {!loading && !group && (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-600" /> Bạn chưa tham gia nhóm</CardTitle>
              <CardDescription>Hãy tham gia nhóm để bắt đầu dự án. Danh sách môn học đang mở hiển thị bên dưới.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm font-medium">Chọn môn để tìm nhóm</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {activeCourses.map(c => (
                      <Button key={c.courseId} variant={selectedCourseCode === (c.courseCode || '') ? 'outline' : 'ghost'} onClick={async () => {
                        setSelectedCourseCode(c.courseCode || '')
                        // load groups for this course
                        setLoadingGroups(true)
                        try {
                          const res = await fetch(`/api/proxy/Group/GetAllGroups?CourseCode=${encodeURIComponent((c.courseCode || '').toLowerCase())}`, { cache: 'no-store' })
                          if (res.ok) {
                            const data = await res.json()
                            const list = Array.isArray(data) ? data : []
                            const normalized = list.map((d: any) => ({
                              groupId: d.groupId || d.id || d.Id || d.GroupId || d.groupID || d.GroupID || '',
                              name: d.name || d.groupName || d.group_name || d.GroupName || d.groupName || '',
                              memberCount: (d.countMembers ?? d.memberCount ?? (Array.isArray(d.members) ? d.members.length : undefined)) || 0,
                              raw: d,
                            }))
                            setAvailableGroups(normalized)
                          } else {
                            console.warn('Failed to load groups for course', c.courseCode, res.status)
                            setAvailableGroups([])
                          }
                        } catch (err) {
                          console.error('Error loading groups:', err)
                          setAvailableGroups([])
                        } finally {
                          setLoadingGroups(false)
                        }
                      }}>{c.courseCode} — {c.courseName}</Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => router.push('/student/group')}>Tìm nhóm theo thao tác</Button>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Danh sách nhóm cho: {selectedCourseCode || '—'}</div>
                {loadingGroups ? (
                  <div>Đang tải danh sách nhóm…</div>
                ) : (
                  <div className="space-y-2">
                    {availableGroups.length === 0 ? (
                      <div className="text-sm text-gray-500">Chưa có nhóm. Hãy chọn môn khác hoặc tạo nhóm mới.</div>
                    ) : (
                      availableGroups.map((g: any) => (
                        <div key={g.groupId || g.raw?.id || g.raw?.Id || Math.random()} className="p-3 border rounded flex items-center justify-between">
                          <div>
                            <div className="font-medium">{g.name || g.raw?.groupName || g.raw?.name}</div>
                            <div className="text-sm text-gray-600">{(g.memberCount ?? g.raw?.memberCount ?? (Array.isArray(g.raw?.members) ? g.raw.members.length : 0))} thành viên</div>
                          </div>
                          <div>
                            <Button size="sm" onClick={async () => {
                              if (!user) return
                              try {
                                const uid = user.userId
                                const gid = g.groupId || g.raw?.id || g.raw?.Id
                                await GroupService.joinGroup(gid, uid)
                                // refresh dashboard
                                const cur = getCurrentUser()
                                if (cur) updateCurrentUser(cur)
                                window.dispatchEvent(new CustomEvent('userStateChanged'))
                                // navigate to group detail
                                router.push(`/student/groups/${gid}`)
                              } catch (err) {
                                console.error('Join group failed', err)
                              }
                            }}>Tham gia</Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> Thông tin Nhóm</CardTitle>
              <CardDescription>Nhóm hiện tại và mentor hướng dẫn</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-24 w-full" />
              ) : group ? (
                <div className="space-y-2">
                  <div className="font-semibold">{group.groupName}</div>
                  <div className="text-sm text-gray-600">Trạng thái: {group.status}</div>
                  <div className="text-sm text-gray-600">Mentor: {group.lecturerName || '—'}</div>
                  <div className="pt-2">
                    <Button onClick={() => router.push(`/student/groups/${group.groupId}`)}>Xem nhóm của tôi</Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-600">Chưa tham gia nhóm</div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><GraduationCap className="w-5 h-5" /> Tình trạng Học tập</CardTitle>
              <CardDescription>GPA tạm tính và tiến độ</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-24 w-full" />
              ) : (
                <div className="space-y-2">
                  <div className="text-3xl font-bold">{gpa}</div>
                  <div className="text-sm text-gray-600">GPA tạm tính dựa trên điểm có sẵn</div>
                  <Badge variant="secondary" className="mt-2">Dữ liệu mẫu</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" /> Deadline sắp tới</CardTitle>
              <CardDescription>3 công việc gần nhất</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-24 w-full" />
              ) : upcoming.length === 0 ? (
                <div className="text-sm text-gray-600">Không có deadline trong tuần này</div>
              ) : (
                <div className="space-y-2">
                  {upcoming.map(t => (
                    <div key={t.taskId} className="flex items-center justify-between text-sm">
                      <div className="font-medium truncate mr-2">{t.taskName}</div>
                      <div className="text-gray-600">{new Date(t.dueDate).toLocaleDateString('vi-VN')}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
            <CardHeader>
                <CardTitle>Phân bố trạng thái công việc</CardTitle>
                <CardDescription>Thống kê công việc theo trạng thái</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                <Skeleton className="h-48 w-full" />
                ) : (
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusChart}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#2563eb" />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
                )}
            </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Thông báo & Tin tức</span>
                        <Badge>Sắp ra mắt</Badge>
                    </CardTitle>
                    <CardDescription>Cập nhật mới nhất từ giảng viên và hệ thống</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-48 text-center space-y-3">
                    <div className="bg-gray-100 p-3 rounded-full">
                        <AlertTriangle className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-muted-foreground max-w-xs">
                        Hệ thống thông báo đang được phát triển. Bạn sẽ sớm nhận được thông báo về deadline và yêu cầu nhóm tại đây.
                    </p>
                </CardContent>
            </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
