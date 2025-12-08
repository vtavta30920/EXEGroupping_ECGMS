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
import { getCurrentUser, updateCurrentUser, getUserIdFromJWT } from "@/lib/utils/auth"
import ChangeMockData, { type ChangeMockDataProps } from "@/components/features/ChangeMockData"
import { mockGroups } from "@/lib/mock-data/groups"
import { useToast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import { GroupMemberService as GeneratedGroupMemberService } from "@/lib/api/generated"

export default function FindGroupsPage() {
  const router = useRouter()
  const { toast } = useToast()
  // State để track việc đang redirect đến trang nhóm
  const [isRedirecting, setIsRedirecting] = React.useState(false);
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

  // Function to refresh user state
  const refreshUser = React.useCallback(() => {
    const currentUser = getCurrentUser() as any;
    setUser(currentUser);
    console.log("🔄 [refreshUser] User state refreshed:", currentUser);
  }, []);

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
        // Sử dụng API GetGroupByCourseCode giống như admin page
        if (!selectedCourse) {
          setGroups([]);
          return;
        }
        
        try {
          const res = await fetch(`/api/proxy/Group/GetGroupByCourseCode/${encodeURIComponent(selectedCourse)}`, {
            cache: 'no-store',
            next: { revalidate: 0 },
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0',
            },
          });
          
          if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`GetGroupByCourseCode failed: ${res.status} ${res.statusText} ${text}`);
          }
          
          const groupsRaw = await res.json();
          const groupsArray = Array.isArray(groupsRaw) ? groupsRaw : [];
          
          // Map API response to FeGroup format
          const mappedGroups = groupsArray.map((g: any) => {
            const members = Array.isArray(g.groupMembers) ? g.groupMembers : (Array.isArray(g.members) ? g.members : []);
            const memberCount = (g.countMembers ?? 0) || members.length;
            
            return {
              groupId: g.id || g.groupId || '',
              id: g.id || g.groupId || '',
              groupName: g.name || g.groupName || 'Chưa đặt tên',
              name: g.name || g.groupName || 'Chưa đặt tên',
              courseId: g.course?.id || g.courseId || '',
              courseCode: g.course?.courseCode || g.courseCode || selectedCourse,
              courseName: g.course?.courseName || g.courseName || '',
              memberCount,
              maxMembers: g.maxMembers || 5,
              leaderId: g.leaderId || (g.leader?.id ?? ''),
              leaderName: g.leader?.fullName || g.leader?.fullname || '',
              status: (g.status || (memberCount >= (g.maxMembers || 5) ? 'finalize' : 'open')) as 'open' | 'finalize' | 'private',
              members: members.map((m: any) => ({
                userId: m.userId || m.id || '',
                fullName: m.fullName || m.user?.fullName || m.username || m.email || 'Thành viên',
                role: (m.roleInGroup === 'Leader' || m.roleInGroup === 'Group Leader' || m.isLeader) ? 'leader' : 'member',
                roleInGroup: m.roleInGroup || (m.role === 'leader' ? 'Leader' : 'Member'),
              })),
              majors: [] as ("SE" | "SS")[],
              createdDate: g.createdAt || '',
              topicName: g.topicName || null,
              needs: [],
              isLockedByRule: false,
            };
          });
          
          let filtered = mappedGroups;
          if (onlyEmpty) {
            filtered = filtered.filter(g => (g.memberCount || 0) === 0);
          }
          
          setGroups(filtered);
        } catch (apiError) {
          console.error("Failed to fetch groups from GetGroupByCourseCode:", apiError);
          // Fallback to GroupService.getGroups()
          const data = await GroupService.getGroups();
          let filtered = data.filter(g => (g.courseCode || "").toUpperCase() === selectedCourse.toUpperCase());
          if (onlyEmpty) filtered = filtered.filter(g => (g.memberCount || 0) === 0);
          setGroups(filtered);
        }
      }
    } catch (error) {
      console.error("Failed to fetch groups:", error);
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  }, [useMock, selectedCourse, onlyEmpty])

  React.useEffect(() => {
    loadGroups()
  }, [loadGroups])

  // Listen for user state changes (e.g., when leaving group)
  React.useEffect(() => {
    const handleUserStateChange = () => {
      console.log("📡 [userStateChange] Received user state change event");
      refreshUser();
    };

    window.addEventListener('userStateChanged', handleUserStateChange);

    // Also refresh user state on mount to ensure we have latest data
    refreshUser();

    return () => {
      window.removeEventListener('userStateChanged', handleUserStateChange);
    };
  }, [refreshUser])

  React.useEffect(() => {
    (async () => {
      const cu = getCurrentUser() as any
      if (!cu || cu.role !== 'student') return
      
      // Nếu user đã có groupId trong state, redirect ngay đến trang chi tiết nhóm
      if (cu.groupId) {
        console.log("✅ [MyGroup] User already has groupId, redirecting to group detail:", cu.groupId);
        setIsRedirecting(true);
        router.push(`/student/groups/${cu.groupId}`)
        return
      }
      
      // Nếu chưa có groupId, thử fetch từ API
      let uid = getUserIdFromJWT() || String(cu.userId || '')
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
        } catch {}
      }
      
      const guidFinal = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uid)
      if (!guidFinal) {
        console.log("⚠️ [MyGroup] Could not resolve valid userId, showing group list");
        return
      }
      
      try {
        const list = await GeneratedGroupMemberService.getApiGroupMember({ userId: uid })
        const items = Array.isArray(list) ? list : []
        if (items.length > 0) {
          const gid = items[0]?.groupId
          if (gid) {
            console.log("✅ [MyGroup] Found group from API, redirecting:", gid);
            const updated = { ...cu, groupId: gid }
            updateCurrentUser(updated)
            setUser(updated)
            setIsRedirecting(true);
            router.push(`/student/groups/${gid}`)
            return
          }
        }
        console.log("ℹ️ [MyGroup] No group found from API, showing group list");
      } catch (err) {
        console.warn("⚠️ [MyGroup] Error checking group membership:", err);
      }
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
        // 🔧 FIX: Ưu tiên lấy userId từ JWT nameidentifier
        let userIdToUse = getUserIdFromJWT() || user.userId;
        console.log("🔍 [handleJoinGroup] userId từ JWT:", getUserIdFromJWT(), "từ user:", user.userId, "sử dụng:", userIdToUse);

        if (!userIdToUse) {
          throw new Error("User ID is required to join group");
        }

        // Nếu vẫn không phải GUID, thử lấy từ API (fallback)
        const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userIdToUse);
        if (!isGuid && user.email) {
          console.log("🔄 [handleJoinGroup] userId vẫn không phải GUID, lấy từ API...");
          try {
            let ok = false;
            let res = await fetch(`/api/proxy/api/User/email/${encodeURIComponent(user.email)}`, { cache: 'no-store', headers: { accept: 'text/plain' } });
            if (res.ok) {
              const raw = await res.json();
              userIdToUse = raw?.id || userIdToUse;
              ok = true;
              console.log("✅ [handleJoinGroup] Lấy userId từ API:", userIdToUse);
            }
            if (!ok) {
              res = await fetch(`/api/proxy/User/email/${encodeURIComponent(user.email)}`, { cache: 'no-store', headers: { accept: 'application/json' } });
              if (res.ok) {
                const raw = await res.json();
                userIdToUse = raw?.id || userIdToUse;
                ok = true;
              }
            }
            if (!ok) {
              try {
                const raw = await (await import('@/lib/api/generated/services/UserService')).UserService.getApiUserEmail({ email: user.email });
                userIdToUse = (raw as any)?.id || userIdToUse;
              } catch {}
            }
          } catch (apiError) {
            console.warn("❌ [handleJoinGroup] Lỗi lấy userId từ API:", apiError);
          }
        }

        await GroupService.joinGroup(groupId, userIdToUse)

        // Bước 2: Nếu là người đầu tiên, set LeaderId
        if (isFirstMember) {
          try {
            await GroupService.updateGroup(groupId, { leaderId: userIdToUse })
            toast({
              title: "🎉 Chúc mừng Tân Trưởng Nhóm!",
              description: "Bạn là thành viên đầu tiên và đã trở thành Leader.",
              className: "bg-yellow-50 border-yellow-200 text-yellow-800"
            })
          } catch (leaderErr) {
            console.error("Set leader failed", leaderErr) 
          }
        } else {
          toast({ title: "Thành công", description: `Đã tham gia nhóm ${g.groupName}` })
        }

        // Bước 3: Cập nhật user + chuyển trang
        const newUser = { ...user, groupId } as any
        console.log("✅ [handleJoinGroup] Updating user with groupId:", groupId, "New user:", newUser);
        updateCurrentUser(newUser)
        setUser(newUser)

        // Dispatch event to notify other components about user state change
        window.dispatchEvent(new CustomEvent('userStateChanged'));
        console.log("📡 [handleJoinGroup] Dispatched userStateChanged event");

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

  // Nếu đang redirect đến trang nhóm, hiển thị loading
  if (isRedirecting) {
    return (
      <DashboardLayout role="student">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          <p className="text-gray-600">Đang chuyển đến nhóm của bạn...</p>
        </div>
      </DashboardLayout>
    )
  }

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
