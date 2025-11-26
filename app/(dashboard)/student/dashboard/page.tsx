"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { getCurrentUser } from "@/lib/utils/auth"
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

  useEffect(() => {
    const currentUser = getCurrentUser() as User | null
    if (!currentUser || currentUser.role !== "student") { router.push("/login"); return }
    setUser(currentUser)
    ;(async () => {
      try {
        const hasGroupId = !!currentUser.groupId
        if (!hasGroupId) {
          const courses = await CourseService.getCourses()
          const list = (Array.isArray(courses) ? courses : []).filter(c => String((c as any).status || '').toLowerCase() !== 'inactive')
          setActiveCourses(list)
          setGroup(null)
          setTasks([])
        } else {
          const g = await GroupService.getGroupById(String(currentUser.groupId))
          setGroup(g)
          const ts = await TaskService.getTasksByGroupId(String(currentUser.groupId))
          setTasks(ts)
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [router])

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
              <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => router.push('/student/group')}>Tìm nhóm ngay</Button>
              <div className="flex flex-wrap gap-2">
                {activeCourses.map(c => (
                  <Badge key={c.courseId} className="bg-blue-100 text-blue-700">{c.courseCode} — {c.courseName}</Badge>
                ))}
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
                  <Button variant="outline" className="mt-2" onClick={() => router.push('/student/group')}>Vào không gian làm việc</Button>
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
      </div>
    </DashboardLayout>
  )
}
