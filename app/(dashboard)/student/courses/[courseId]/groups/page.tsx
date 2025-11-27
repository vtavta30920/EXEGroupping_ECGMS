//  app/(dashboard)/student/courses/[courseId]/groups/page.tsx
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { GroupCard } from "@/components/features/group/GroupCard"
import { Button } from "@/components/ui/button"
import { PlusCircle, Filter, Loader2 } from "lucide-react"
import { GroupService } from "@/lib/api/groupService"
import type { Group, User } from "@/lib/types"
import { getCurrentUser, updateCurrentUser, getUserIdFromJWT } from "@/lib/utils/auth"
import { useToast } from "@/components/ui/use-toast"
import { isSelfSelectOpen } from "@/lib/config/businessRules"
import ChangeMockData, { type ChangeMockDataProps } from "@/components/features/ChangeMockData"
import { mockGroups } from "@/lib/mock-data/groups"

export default function FindGroupsPage({ params }: { params: { courseId: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [groups, setGroups] = React.useState<Group[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [joiningId, setJoiningId] = React.useState<string | null>(null)
  const [user, setUser] = React.useState<User | null>(null)
  const [useMock, setUseMock] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    try {
      const v = localStorage.getItem('useMock')
      return v ? v === 'true' : true
    } catch { return true }
  })

  const loadGroups = React.useCallback(async () => {
    setIsLoading(true)
    try {
      if (useMock) {
        const data = mockGroups.filter(g => (g.courseCode || '').toUpperCase() === params.courseId.toUpperCase())
        const visible = data.filter(g => g.status !== 'private')
        setGroups(visible)
      } else {
        const data = await GroupService.getGroups(params.courseId)
        const visible = data.filter(g => g.status !== 'private')
        setGroups(visible)
      }
    } catch (err) {
      console.error("Failed to fetch groups:", err)
    } finally {
      setIsLoading(false)
    }
  }, [useMock, params.courseId])

  React.useEffect(() => {
    // Load user
    const u = getCurrentUser() as User | null
    setUser(u)
    if (params.courseId) loadGroups()
  }, [params.courseId, loadGroups])

  const handleJoinGroup = async (groupId: string) => {
    if (!user || user.role !== 'student') {
      toast({ title: "Cần đăng nhập", description: "Vui lòng đăng nhập bằng tài khoản sinh viên." })
      router.push('/login')
      return
    }
    if (!isSelfSelectOpen()) {
      toast({ title: "Hết thời hạn", description: "Thời hạn tự chọn nhóm đã kết thúc." })
      return
    }
    if (user.groupId) {
      toast({ title: "Bạn đã có nhóm", description: "Không thể tham gia nhóm khác." })
      return
    }
    const g = groups.find(x => x.groupId === groupId)
    if (!g) return
    if (g.memberCount >= g.maxMembers) {
      toast({ title: "Nhóm đã đủ", description: "Nhóm này đã đủ thành viên. Vui lòng chọn nhóm khác." })
      return
    }
    try {
      setJoiningId(groupId)
      const userIdToUse = getUserIdFromJWT() || user.userId;
      const updated = await GroupService.joinGroup(groupId, userIdToUse)
      // Cập nhật user local
      const newUser = { ...user, groupId: updated.groupId }
      updateCurrentUser(newUser)
      setUser(newUser)
      toast({ title: "Tham gia thành công", description: `Bạn đã tham gia ${updated.groupName}.` })
      // Chuyển đến trang nhóm của tôi
      router.push(`/student/groups/${updated.groupId}`)
    } catch (err: any) {
      console.error("JoinGroup error:", err)
      toast({ title: "Lỗi", description: err?.message || "Không thể tham gia nhóm." })
    } finally {
      setJoiningId(null)
    }
  }

  const handleApplyToGroup = async (groupId: string) => {
    toast({ title: "Đang phát triển", description: "Tính năng nộp đơn sẽ sớm có mặt." })
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tìm kiếm Nhóm - {params.courseId}</h1>
            <p className="text-gray-600 mt-1">Tìm một nhóm phù hợp hoặc tạo nhóm của riêng bạn.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Lọc
            </Button>
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              Tạo nhóm mới
            </Button>
            <ChangeMockData
              loading={isLoading}
              onRefresh={loadGroups}
              useMock={useMock}
              setUseMock={setUseMock}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {groups.length > 0 ? (
              groups.map(group => (
                <GroupCard
                  key={group.groupId}
                  group={group}
                  onJoin={handleJoinGroup}
                  onApply={handleApplyToGroup}
                  isJoining={joiningId === group.groupId}
                  disableJoin={Boolean(user?.groupId)}
                />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500 py-10">
                Chưa có nhóm nào trong khóa học này.
              </p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}