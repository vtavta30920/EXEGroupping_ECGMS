// app/(dashboard)/student/group/page.tsx
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { GroupCard } from "@/components/features/group/GroupCard"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Filter, Loader2, Crown, Sparkles, UserPlus } from "lucide-react"
// SỬA: Import Service và Type thay vì Mock Data
import { GroupService } from "@/lib/api/groupService"
import type { Group } from "@/lib/types"
import { getCurrentUser, updateCurrentUser } from "@/lib/utils/auth"
import ChangeMockData, { type ChangeMockDataProps } from "@/components/features/ChangeMockData"
import { mockGroups } from "@/lib/mock-data/groups"
import { useToast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import { GroupMemberService as GeneratedGroupMemberService } from "@/lib/api/generated"

export default function FindGroupsPage() {
  const router = useRouter()
  const { toast } = useToast()
  // State để lưu danh sách nhóm và trạng thái tải
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedCourse, setSelectedCourse] = React.useState<string>("EXE101");
  const [onlyEmpty, setOnlyEmpty] = React.useState<boolean>(false);
  const [useMock, setUseMock] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    try {
      const v = localStorage.getItem('useMock')
      return v ? v === 'true' : true
    } catch { return true }
  });

  // Fetch dữ liệu từ API khi trang được tải
  const loadGroups = React.useCallback(async () => {
    setIsLoading(true)
    try {
      if (useMock) {
        const data = mockGroups
        let filtered = selectedCourse
          ? data.filter(g => (g.courseCode || '').toUpperCase() === selectedCourse.toUpperCase())
          : data
        if (onlyEmpty) filtered = filtered.filter(g => (g.memberCount || 0) === 0)
        setGroups(filtered)
      } else {
        const data = await GroupService.getGroups();
        let filtered = selectedCourse
          ? data.filter(g => (g.courseCode || "").toUpperCase() === selectedCourse.toUpperCase())
          : data;
        if (onlyEmpty) filtered = filtered.filter(g => (g.memberCount || 0) === 0)
        setGroups(filtered);
      }
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    } finally {
      setIsLoading(false);
    }
  }, [useMock, selectedCourse, onlyEmpty])

  React.useEffect(() => {
    loadGroups()
  }, [loadGroups])

  React.useEffect(() => {
    (async () => {
      const cu = getCurrentUser() as any
      if (!cu || cu.role !== 'student') return
      if (cu.groupId) return
      let uid = String(cu.userId || '')
      const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uid)
      if (!isGuid && cu.email) {
        try {
          let ok = false
          let res = await fetch(`/api/proxy/api/User/email/${encodeURIComponent(cu.email)}`, { cache: 'no-store', headers: { accept: 'text/plain' } })
          if (res.ok) {
            const raw = await res.json(); uid = raw?.id || uid; ok = true
          }
          if (!ok) {
            res = await fetch(`/api/proxy/User/email/${encodeURIComponent(cu.email)}`, { cache: 'no-store', headers: { accept: 'application/json' } })
            if (res.ok) { const raw = await res.json(); uid = raw?.id || uid; ok = true }
          }
          if (!ok) {
            try { const raw = await (await import('@/lib/api/generated/services/UserService')).UserService.getApiUserEmail({ email: cu.email }); uid = (raw as any)?.id || uid } catch {}
          }
          if (!ok) {
            // Fallback: tìm membership bằng từ khóa email/username
            try {
              const r2 = await fetch(`/api/proxy/api/GroupMember?Keyword=${encodeURIComponent(cu.email || cu.username || '')}&PageNumber=1&PageSize=10`, { cache: 'no-store', headers: { accept: 'text/plain' } })
              if (r2.ok) {
                const body = await r2.json()
                const items = Array.isArray(body?.items) ? body.items : []
                if (items.length > 0) {
                  const gid = items[0]?.groupId
                  if (gid) {
                    const updated = { ...cu, groupId: gid }
                    updateCurrentUser(updated)
                    setUser(updated)
                    router.push(`/student/groups/${gid}`)
                    return
                  }
                }
              }
            } catch {}
          }
        } catch {}
      }
      const guidFinal = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uid)
      if (!guidFinal) return
      try {
        const list = await GeneratedGroupMemberService.getApiGroupMember({ userId: uid })
        const items = Array.isArray(list) ? list : []
        if (items.length > 0) {
          const gid = items[0]?.groupId
          if (gid) {
            const updated = { ...cu, groupId: gid }
            updateCurrentUser(updated)
            setUser(updated)
            router.push(`/student/groups/${gid}`)
          }
        }
      } catch {}
    })()
  }, [])

  // Kiểm tra tình trạng Passed của EXE101 để hiển thị EXE102
  const [user, setUser] = React.useState(() => getCurrentUser() as any);
  const hasPassedEXE101 = Array.isArray((user as any)?.studentCourses)
    ? ((user as any).studentCourses as any[]).some(sc => (sc.courseCode || sc?.course?.courseCode) === "EXE101" && (sc.status || "").toLowerCase() === "passed")
    : false;

  // Xử lý logic Join/Apply (Cần cập nhật logic thực tế)
  const handleJoinGroup = async (groupId: string) => {
    if (!user || user.role !== 'student') {
      toast({ title: "Cần đăng nhập", description: "Vui lòng đăng nhập bằng tài khoản sinh viên." })
      router.push('/login')
      return
    }
    if ((user as any)?.groupId) {
      toast({ title: "Bạn đã có nhóm", description: "Cần rời nhóm cũ trước khi tham gia nhóm mới." })
      return
    }
    const g = groups.find(x => x.groupId === groupId)
    if (!g) return
    if (g.memberCount >= g.maxMembers) {
      toast({ title: "Nhóm đã đủ", description: "Nhóm này đã đủ thành viên." })
      return
    }
    const isFirstMember = (g.memberCount || 0) === 0
    try {
      if (useMock) {
        const newUser = { ...user, groupId };
        updateCurrentUser(newUser)
        setUser(newUser)
        toast({ title: isFirstMember ? "🎉 Chúc mừng Tân Trưởng Nhóm!" : "Tham gia thành công (Mock)", description: isFirstMember ? "Bạn là thành viên đầu tiên và đã trở thành Leader." : `Bạn đã tham gia ${g.groupName}.`, className: isFirstMember ? "bg-yellow-50 border-yellow-200 text-yellow-800" : undefined })
        router.push(`/student/groups/${groupId}`)
      } else {
        await GroupService.joinGroup(groupId, (user as any).email || (user as any).userId)

        // Bước 2: Nếu là người đầu tiên, set LeaderId
        if (isFirstMember) {
          try {
            await GroupService.updateGroup(groupId, { leaderId: (user as any).userId })
            toast({
              title: "🎉 Chúc mừng Tân Trưởng Nhóm!",
              description: "Bạn là thành viên đầu tiên và đã trở thành Leader.",
              className: "bg-yellow-50 border-yellow-200 text-yellow-800"
            })
          } catch (leaderErr) {
            console.error("Set leader failed", leaderErr)
            toast({ title: "Cảnh báo", description: "Đã vào nhóm nhưng chưa set được Leader. Hãy liên hệ Admin." })
          }
        } else {
          toast({ title: "Thành công", description: `Đã tham gia nhóm ${g.groupName}` })
        }

        // Bước 3: Cập nhật user + chuyển trang
        const newUser = { ...user, groupId } as any
        updateCurrentUser(newUser)
        setUser(newUser)
        router.push(`/student/groups/${groupId}`)
      }
    } catch (err: any) {
      console.error("JoinGroup error:", err)
      toast({ title: "Lỗi tham gia", description: err?.message || "Không thể tham gia nhóm." })
    }
  };

  const handleApplyToGroup = async (groupId: string) => {
    console.log("Apply to group:", groupId);
    alert("Đã nộp đơn (Mô phỏng).");
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tìm kiếm Nhóm</h1>
            <p className="text-gray-600 mt-1">
              Tìm một nhóm phù hợp hoặc tạo nhóm của riêng bạn.
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Chọn môn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXE101">EXE101</SelectItem>
                {hasPassedEXE101 && <SelectItem value="EXE102">EXE102</SelectItem>}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Switch checked={onlyEmpty} onCheckedChange={setOnlyEmpty} id="only-empty" />
              <label htmlFor="only-empty" className="text-sm text-gray-700">Chỉ hiện nhóm trống</label>
            </div>
            
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
                      disableJoin={Boolean((user as any)?.groupId)}
                    />
                ))
              ) : (
                <p className="col-span-full text-center text-gray-500 py-10">
                  Chưa có nhóm nào được hiển thị.
                </p>
              )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
