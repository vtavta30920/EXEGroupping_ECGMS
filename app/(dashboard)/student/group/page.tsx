// app/(dashboard)/student/group/page.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { GroupCard } from "@/components/features/group/GroupCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Filter, Loader2, Crown, Sparkles, Search } from "lucide-react";
// SỬA: Import Service và Type thay vì Mock Data
import { GroupService } from "@/lib/api/groupService";
import type { Group } from "@/lib/types";
import {
  getCurrentUser,
  updateCurrentUser,
  getUserIdFromJWT,
} from "@/lib/utils/auth";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { GroupMemberService as GeneratedGroupMemberService } from "@/lib/api/generated";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FindGroupsPage() {
  const router = useRouter();
  const { toast } = useToast();
  // State để track việc đang redirect đến trang nhóm
  const [isRedirecting, setIsRedirecting] = React.useState(false);
  // State để lưu danh sách nhóm và trạng thái tải
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedCourse, setSelectedCourse] = React.useState<string>("EXE101");
  const [onlyEmpty, setOnlyEmpty] = React.useState<boolean>(false);
  const [activeTab, setActiveTab] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState(""); // New state for search
  const [user, setUser] = React.useState(() => getCurrentUser() as any);
  const hasPassedEXE101 = Array.isArray((user as any)?.studentCourses)
    ? ((user as any).studentCourses as any[]).some(
        (sc) =>
          (sc.courseCode || sc?.course?.courseCode) === "EXE101" &&
          (sc.status || "").toLowerCase() === "passed"
      )
    : false;

  // Function to refresh user state
  const refreshUser = React.useCallback(() => {
    const currentUser = getCurrentUser() as any;
    setUser(currentUser);
    console.log("🔄 [refreshUser] User state refreshed:", currentUser);
  }, []);

  // Fetch dữ liệu từ API khi trang được tải
  const loadGroups = React.useCallback(async () => {
    setIsLoading(true);
    try {
      // Sử dụng API GetGroupByCourseCode giống như admin page
      if (!selectedCourse) {
        setGroups([]);
        return;
      }

      try {
        const res = await fetch(
          `/api/proxy/Group/GetGroupByCourseCode/${encodeURIComponent(
            selectedCourse
          )}`,
          {
            cache: "no-store",
            next: { revalidate: 0 },
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
          }
        );

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(
            `GetGroupByCourseCode failed: ${res.status} ${res.statusText} ${text}`
          );
        }

        const groupsRaw = await res.json();
        const groupsArray = Array.isArray(groupsRaw) ? groupsRaw : [];

        // Map API response to FeGroup format
        const mappedGroups = groupsArray.map((g: any) => {
          const members = Array.isArray(g.groupMembers)
            ? g.groupMembers
            : Array.isArray(g.members)
            ? g.members
            : [];
          const memberCount = (g.countMembers ?? 0) || members.length;

          return {
            groupId: g.id || g.groupId || "",
            id: g.id || g.groupId || "",
            groupName: g.name || g.groupName || "Chưa đặt tên",
            name: g.name || g.groupName || "Chưa đặt tên",
            courseId: g.course?.id || g.courseId || "",
            courseCode: g.course?.courseCode || g.courseCode || selectedCourse,
            courseName: g.course?.courseName || g.courseName || "",
            memberCount,
            maxMembers: g.maxMembers || 6,
            leaderId: g.leaderId || (g.leader?.id ?? ""),
            leaderName: g.leader?.fullName || g.leader?.fullname || "",
            status: (g.status ||
              (memberCount >= (g.maxMembers || 5) ? "finalize" : "open")) as
              | "open"
              | "finalize"
              | "private",
            members: members.map((m: any) => ({
              userId: m.userId || m.id || "",
              fullName:
                m.fullName ||
                m.user?.fullName ||
                m.username ||
                m.email ||
                "Thành viên",
              role:
                m.roleInGroup === "Leader" ||
                m.roleInGroup === "Group Leader" ||
                m.isLeader
                  ? "leader"
                  : "member",
              roleInGroup:
                m.roleInGroup || (m.role === "leader" ? "Leader" : "Member"),
            })),
            majors: [] as ("SE" | "SS")[],
            createdDate: g.createdAt || "",
            topicName: g.topicName || null,
            needs: [],
            isLockedByRule: false,
          };
        });

        let filtered = mappedGroups;
        if (onlyEmpty) {
          filtered = filtered.filter((g) => (g.memberCount || 0) === 0);
        }

        // Apply search filter
        if (searchQuery) {
          const lowerQuery = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (g) =>
              g.groupName.toLowerCase().includes(lowerQuery) ||
              g.leaderName.toLowerCase().includes(lowerQuery)
          );
        }

        setGroups(filtered);
      } catch (apiError) {
        console.error(
          "Failed to fetch groups from GetGroupByCourseCode:",
          apiError
        );
        // Fallback to GroupService.getGroups()
        const data = await GroupService.getGroups();
        let filtered = data.filter(
          (g) =>
            (g.courseCode || "").toUpperCase() === selectedCourse.toUpperCase()
        );
        if (onlyEmpty)
          filtered = filtered.filter((g) => (g.memberCount || 0) === 0);

        // Apply search filter for fallback
        if (searchQuery) {
          const lowerQuery = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (g) =>
              g.groupName.toLowerCase().includes(lowerQuery) ||
              g.leaderName.toLowerCase().includes(lowerQuery)
          );
        }

        setGroups(filtered);
      }
    } catch (error) {
      console.error("Failed to fetch groups:", error);
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCourse, onlyEmpty, searchQuery]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      loadGroups();
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [loadGroups]);

  // Listen for user state changes (e.g., when leaving group)
  React.useEffect(() => {
    const handleUserStateChange = () => {
      console.log("📡 [userStateChange] Received user state change event");
      refreshUser();
    };

    window.addEventListener("userStateChanged", handleUserStateChange);

    // Also refresh user state on mount to ensure we have latest data
    refreshUser();

    return () => {
      window.removeEventListener("userStateChanged", handleUserStateChange);
    };
  }, [refreshUser]);

  React.useEffect(() => {
    (async () => {
      const cu = getCurrentUser() as any;
      if (!cu || cu.role !== "student") return;

      // Nếu user đã có groupId trong state, redirect ngay đến trang chi tiết nhóm
      if (cu.groupId) {
        console.log(
          "✅ [MyGroup] User already has groupId, redirecting to group detail:",
          cu.groupId
        );
        setIsRedirecting(true);
        router.push(`/student/groups/${cu.groupId}`);
        return;
      }

      // Nếu chưa có groupId, thử fetch từ API
      let uid = getUserIdFromJWT() || String(cu.userId || "");
      const isGuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          uid
        );

      if (!isGuid && cu.email) {
        try {
          let ok = false;
          let res = await fetch(
            `/api/proxy/api/User/email/${encodeURIComponent(cu.email)}`,
            { cache: "no-store", headers: { accept: "text/plain" } }
          );
          if (res.ok) {
            const raw = await res.json();
            uid = raw?.id || uid;
            ok = true;
          }
          if (!ok) {
            res = await fetch(
              `/api/proxy/User/email/${encodeURIComponent(cu.email)}`,
              { cache: "no-store", headers: { accept: "application/json" } }
            );
            if (res.ok) {
              const raw = await res.json();
              uid = raw?.id || uid;
              ok = true;
            }
          }
          if (!ok) {
            try {
              const raw = await (
                await import("@/lib/api/generated/services/UserService")
              ).UserService.getApiUserEmail({ email: cu.email });
              uid = (raw as any)?.id || uid;
            } catch {}
          }
        } catch {}
      }

      const guidFinal =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          uid
        );
      if (!guidFinal) {
        console.log(
          "⚠️ [MyGroup] Could not resolve valid userId, showing group list"
        );
        return;
      }

      try {
        const list = await GeneratedGroupMemberService.getApiGroupMember({
          userId: uid,
        });
        const items = Array.isArray(list) ? list : [];
        if (items.length > 0) {
          const gid = items[0]?.groupId;
          if (gid) {
            console.log("✅ [MyGroup] Found group from API, redirecting:", gid);
            const updated = { ...cu, groupId: gid };
            updateCurrentUser(updated);
            setUser(updated);
            setIsRedirecting(true);
            router.push(`/student/groups/${gid}`);
            return;
          }
        }
        console.log("ℹ️ [MyGroup] No group found from API, showing group list");
      } catch (err) {
        console.warn("⚠️ [MyGroup] Error checking group membership:", err);
      }
    })();
  }, []);

  // Xử lý logic Join/Apply (Cần cập nhật logic thực tế)
  const handleJoinGroup = async (groupId: string) => {
    if (!user || user.role !== "student") {
      toast({
        title: "Cần đăng nhập",
        description: "Vui lòng đăng nhập bằng tài khoản sinh viên.",
      });
      router.push("/login");
      return;
    }
    if ((user as any)?.groupId) {
      toast({
        title: "Bạn đã có nhóm",
        description: "Cần rời nhóm cũ trước khi tham gia nhóm mới.",
      });
      return;
    }
    const g = groups.find((x) => x.groupId === groupId);
    if (!g) return;
    if (g.memberCount >= g.maxMembers) {
      toast({ title: "Nhóm đã đủ", description: "Nhóm này đã đủ thành viên." });
      return;
    }
    const isFirstMember = (g.memberCount || 0) === 0;
    try {
      // 🔧 FIX: Ưu tiên lấy userId từ JWT nameidentifier
      let userIdToUse = getUserIdFromJWT() || user.userId;
      console.log(
        "🔍 [handleJoinGroup] userId từ JWT:",
        getUserIdFromJWT(),
        "từ user:",
        user.userId,
        "sử dụng:",
        userIdToUse
      );

      if (!userIdToUse) {
        throw new Error("User ID is required to join group");
      }

      // Nếu vẫn không phải GUID, thử lấy từ API (fallback)
      const isGuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          userIdToUse
        );
      if (!isGuid && user.email) {
        console.log(
          "🔄 [handleJoinGroup] userId vẫn không phải GUID, lấy từ API..."
        );
        try {
          let ok = false;
          let res = await fetch(
            `/api/proxy/api/User/email/${encodeURIComponent(user.email)}`,
            { cache: "no-store", headers: { accept: "text/plain" } }
          );
          if (res.ok) {
            const raw = await res.json();
            userIdToUse = raw?.id || userIdToUse;
            ok = true;
            console.log("✅ [handleJoinGroup] Lấy userId từ API:", userIdToUse);
          }
          if (!ok) {
            res = await fetch(
              `/api/proxy/User/email/${encodeURIComponent(user.email)}`,
              { cache: "no-store", headers: { accept: "application/json" } }
            );
            if (res.ok) {
              const raw = await res.json();
              userIdToUse = raw?.id || userIdToUse;
              ok = true;
            }
          }
          if (!ok) {
            try {
              const raw = await (
                await import("@/lib/api/generated/services/UserService")
              ).UserService.getApiUserEmail({ email: user.email });
              userIdToUse = (raw as any)?.id || userIdToUse;
            } catch {}
          }
        } catch (apiError) {
          console.warn("❌ [handleJoinGroup] Lỗi lấy userId từ API:", apiError);
        }
      }

      await GroupService.joinGroup(groupId, userIdToUse);

      // Bước 2: Nếu là người đầu tiên, set LeaderId
      if (isFirstMember) {
        try {
          await GroupService.updateGroup(groupId, { leaderId: userIdToUse });
          toast({
            title: "🎉 Chúc mừng Tân Trưởng Nhóm!",
            description: "Bạn là thành viên đầu tiên và đã trở thành Leader.",
            className: "bg-yellow-50 border-yellow-200 text-yellow-800",
          });
        } catch (leaderErr) {
          console.error("Set leader failed", leaderErr);
        }
      } else {
        toast({
          title: "Thành công",
          description: `Đã tham gia nhóm ${g.groupName}`,
        });
      }

      // Bước 3: Cập nhật user + chuyển trang
      const newUser = { ...user, groupId } as any;
      console.log(
        "✅ [handleJoinGroup] Updating user with groupId:",
        groupId,
        "New user:",
        newUser
      );
      updateCurrentUser(newUser);
      setUser(newUser);

      // Dispatch event to notify other components about user state change
      window.dispatchEvent(new CustomEvent("userStateChanged"));
      console.log("📡 [handleJoinGroup] Dispatched userStateChanged event");

      router.push(`/student/groups/${groupId}`);
    } catch (err: any) {
      console.error("JoinGroup error:", err);
      toast({
        title: "Lỗi tham gia",
        description: err?.message || "Không thể tham gia nhóm.",
      });
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
    );
  }

  // Pagination state
  const [page, setPage] = React.useState(1);
  const pageSize = 12;
  const totalPages = Math.max(1, Math.ceil(groups.length / pageSize));
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pagedGroups = groups.slice(start, end);

  React.useEffect(() => {
    setPage(1);
  }, [selectedCourse, onlyEmpty, searchQuery, isLoading]);

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <Search className="h-8 w-8 text-primary" />
                Tìm kiếm Nhóm
              </h1>
              <p className="text-gray-500 text-lg">
                Tìm một nhóm phù hợp hoặc tạo nhóm của riêng bạn.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full md:w-auto bg-gray-50 p-3 rounded-lg border">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm theo tên nhóm..."
                  className="pl-9 w-full bg-white border-gray-200 focus-visible:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-full sm:w-[140px] bg-white border-gray-200">
                  <SelectValue placeholder="Chọn môn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXE101">EXE101</SelectItem>
                  {hasPassedEXE101 && (
                    <SelectItem value="EXE102">EXE102</SelectItem>
                  )}
                </SelectContent>
              </Select>

              <div
                className="flex items-center gap-2 border border-gray-200 px-3 py-2 rounded-md h-10 bg-white hover:bg-gray-50 transition-colors cursor-pointer select-none"
                onClick={() => setOnlyEmpty(!onlyEmpty)}
              >
                <Switch
                  checked={onlyEmpty}
                  onCheckedChange={setOnlyEmpty}
                  id="only-empty"
                  className="data-[state=checked]:bg-primary"
                />
                <label
                  htmlFor="only-empty"
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Nhóm trống
                </label>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="all">Tất cả nhóm</TabsTrigger>
                {/* <TabsTrigger value="suggested">
                  Gợi ý cho bạn{" "}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Coming Soon
                  </Badge>
                </TabsTrigger> */}
              </TabsList>
            </div>

            <TabsContent value="all" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pagedGroups.length > 0 ? (
                  pagedGroups.map((group) => (
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
              <div className="flex items-center justify-between border-t pt-4">
                <div className="text-sm text-gray-600">
                  Trang {page}/{totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                  >
                    Sau
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* <TabsContent value="suggested">
              <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-gray-50 border-dashed">
                <Sparkles className="h-10 w-10 text-yellow-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">
                  Gợi ý ghép nhóm thông minh
                </h3>
                <p className="text-gray-500 max-w-md mt-2">
                  Tính năng này sẽ tự động gợi ý các nhóm phù hợp dựa trên
                  chuyên ngành và kỹ năng của bạn.
                  <br />
                  <span className="font-semibold text-blue-600">
                    Sắp ra mắt!
                  </span>
                </p>
              </div>
            </TabsContent> */}
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
