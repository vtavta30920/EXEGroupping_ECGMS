"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Crown,
  Pencil,
  UserMinus,
  UserPlus,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  getCurrentUser,
  getUserIdFromJWT,
  updateCurrentUser,
} from "@/lib/utils/auth";
import { GroupService } from "@/lib/api/groupService";
import { GroupMemberService } from "@/lib/api/generated/services/GroupMemberService";
import { TopicService } from "@/lib/api/generated/services/TopicService";

export default function StudentGroupDetailPage() {
  const router = useRouter();
  const params = useParams() as { groupId?: string };
  const [user, setUser] = React.useState<any>(null);
  const [group, setGroup] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [topicOpen, setTopicOpen] = React.useState(false);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [leaveOpen, setLeaveOpen] = React.useState(false);
  const [transferOpen, setTransferOpen] = React.useState(false);
  const [newLeaderId, setNewLeaderId] = React.useState<string>("");
  const [transferSubmitting, setTransferSubmitting] = React.useState(false);
  const [kickOpen, setKickOpen] = React.useState(false);
  const [kickMember, setKickMember] = React.useState<any>(null);
  const [topics, setTopics] = React.useState<any[]>([]);
  const [topicName, setTopicName] = React.useState("");
  const [topicDesc, setTopicDesc] = React.useState("");
  const [inviteQuery, setInviteQuery] = React.useState("");
  const [candidates, setCandidates] = React.useState<any[]>([]);
  const [inviting, setInviting] = React.useState(false);
  const [updatingReady, setUpdatingReady] = React.useState(false);

  const groupId = params.groupId || "";

  const isLeader = React.useMemo(() => {
    const uid = user?.userId || user?.id;

    // Primary check: check if user has roleInGroup = 'leader' in members list
    const isLeaderByRole =
      group?.members?.some((m: any) => {
        const memberUserId = String(m.userId || "");
        const currentUserId = String(uid || "");
        const memberRole = String(m.roleInGroup || m.role || "").toLowerCase();
        const isMatch =
          memberUserId === currentUserId && memberRole === "leader";

        return isMatch;
      }) || false;

    // Fallback: check if user is group leader by leaderId
    const leaderId = group?.leaderId;
    const isLeaderByLeaderId = Boolean(
      uid && leaderId && String(leaderId) === String(uid)
    );

    const finalIsLeader = isLeaderByRole || isLeaderByLeaderId;
    return finalIsLeader;
  }, [user, group]);

  async function loadGroup() {
    setLoading(true);
    try {
      // Try to get group by current user ID first (will have fullName in members)
      let g = null;
      if (user?.userId) {
        try {
          g = await GroupService.getGroupByStudentId(user.userId);
        } catch (error) {
          // Fallback to getGroupById
        }
      }

      // Fallback to getGroupById if above failed or group doesn't match
      if (!g || g.groupId !== groupId) {
        g = await GroupService.getGroupById(groupId);
      }

      setGroup(g);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    const u = getCurrentUser();
    if (!u || u.role !== "student") {
      router.push("/login");
      return;
    }
    console.log("👤 [useEffect] Current user:", {
      userId: u.userId,
      email: u.email,
      fullName: u.fullName,
      role: u.role,
    });
    setUser(u);
    if (groupId) loadGroup();
  }, [groupId]);

  async function openTopicDialog() {
    setTopicOpen(true);
    setTopicName(group?.topic?.topicName || "");
    setTopicDesc(group?.topic?.description || "");
    try {
      const list = await TopicService.getApiTopic();
      setTopics(Array.isArray(list) ? list : []);
    } catch {
      setTopics([]);
    }
  }

  async function saveTopic() {
    const selected = topics.find(
      (t) =>
        String(t?.topicName || "")
          .trim()
          .toLowerCase() === topicName.trim().toLowerCase()
    );
    const topicId = selected?.id;
    await GroupService.updateGroup(groupId, {
      name: group.groupName,
      courseId: group.courseId,
      topicId,
    });
    setTopicOpen(false);
    await loadGroup();
  }

  async function handleKick() {
    if (!isLeader || !kickMember) return;

    const member = kickMember;
    setKickOpen(false);

    const memberUserId = member?.userId;
    console.log(
      "🚀 [handleKick] Attempting to kick member:",
      member.fullName,
      "with userId:",
      memberUserId
    );

    if (!memberUserId || !groupId) {
      console.warn("❌ [handleKick] Missing member userId or groupId:", {
        memberUserId,
        groupId,
      });
      return;
    }

    try {
      // Use direct API call to delete group member by userId
      console.log("🔍 [handleKick] Calling DELETE /api/GroupMember/{userId}");
      const response = await fetch(
        `/api/proxy/api/GroupMember/${memberUserId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(
          `Delete failed: ${response.status} ${response.statusText} ${errorText}`
        );
      }

      console.log("✅ [handleKick] Successfully kicked member");
      setKickMember(null);
      await loadGroup();
    } catch (error) {
      console.error("❌ [handleKick] Failed to kick member:", error);
      setKickMember(null);
    }
  }

  async function searchCandidates() {
    try {
      const res = await fetch(
        `/api/proxy/User/UserWithoutGroup?keyword=${encodeURIComponent(
          inviteQuery
        )}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        setCandidates(Array.isArray(data) ? data : []);
      }
    } catch {
      setCandidates([]);
    }
  }

  async function inviteUser(candidate: any) {
    if (!isLeader || !groupId) return;
    setInviting(true);
    try {
      const uid = candidate?.user?.id || candidate?.userId;
      if (uid) {
        await GroupService.joinGroup(groupId, uid);
        await loadGroup();
      }
    } catch {
    } finally {
      setInviting(false);
    }
  }

  async function handleLeave() {
    const userIdToUse = getUserIdFromJWT() || user?.userId;
    if (!userIdToUse || !groupId) {
      setLeaveOpen(false);
      return;
    }
    try {
      await GroupService.leaveGroup(groupId, userIdToUse);

      // Clear groupId from user state after successful leave
      if (user) {
        const updatedUser = { ...user, groupId: null };
        updateCurrentUser(updatedUser);
        console.log("✅ [handleLeave] Cleared groupId from user state");

        // Dispatch event to notify other components about user state change
        window.dispatchEvent(new CustomEvent("userStateChanged"));
      }

      setLeaveOpen(false);
      router.push("/student/group");
    } catch {
      setLeaveOpen(false);
    }
  }

  async function handleTransferAndLeave() {
    // Called when leader selects a new leader and wants to leave
    if (!newLeaderId || !groupId) {
      setTransferOpen(false);
      return;
    }
    setTransferSubmitting(true);
    try {
      const userIdToUse = getUserIdFromJWT() || user?.userId;

      if (!userIdToUse) {
        throw new Error("Cannot identify current user");
      }

      // Step 1: Update the new member's role to Leader using PUT /api/GroupMember/UpdateRoleInGroup/{GroupId}?userId={UserId}
      console.log(
        "🔄 [handleTransferAndLeave] Step 1: Promoting new member to leader:",
        newLeaderId
      );
      const updateRoleResponse = await fetch(
        `/api/proxy/GroupMember/UpdateRoleInGroup/${groupId}?userId=${newLeaderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roleInGroup: "Leader",
          }),
        }
      );

      if (!updateRoleResponse.ok) {
        const errorText = await updateRoleResponse
          .text()
          .catch(() => "Unknown error");
        throw new Error(
          `Failed to promote new leader: ${updateRoleResponse.status} ${updateRoleResponse.statusText} ${errorText}`
        );
      }
      console.log(
        "✅ [handleTransferAndLeave] Step 1 completed: New leader promoted successfully"
      );

      // Step 2: Remove current leader (yourself) from the group
      console.log(
        "🔄 [handleTransferAndLeave] Step 2: Removing current leader from group:",
        userIdToUse
      );
      const deleteResponse = await fetch(
        `/api/proxy/GroupMember/${userIdToUse}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!deleteResponse.ok) {
        const errorText = await deleteResponse
          .text()
          .catch(() => "Unknown error");
        throw new Error(
          `Failed to remove current leader: ${deleteResponse.status} ${deleteResponse.statusText} ${errorText}`
        );
      }
      console.log(
        "✅ [handleTransferAndLeave] Step 2 completed: Current leader removed"
      );

      // Update local user state
      if (user) {
        const updatedUser = { ...user, groupId: null };
        updateCurrentUser(updatedUser);
        window.dispatchEvent(new CustomEvent("userStateChanged"));
      }

      setTransferOpen(false);
      router.push("/student/group");
    } catch (err) {
      console.error("❌ [handleTransferAndLeave] Error:", err);
      alert(
        `Chuyển quyền trưởng nhóm thất bại: ${
          err instanceof Error ? err.message : "Lỗi không xác định"
        }`
      );
      setTransferOpen(false);
    } finally {
      setTransferSubmitting(false);
    }
  }

  async function toggleLock() {
    if (!isLeader) return;
    try {
      const next =
        String(group?.status || "").toLowerCase() === "finalize"
          ? "open"
          : "finalize";
      await GroupService.updateGroup(groupId, {
        name: group.groupName,
        courseId: group.courseId,
        status: next,
      });
      await loadGroup();
    } catch (error) {
      console.error("Error toggling lock:", error);
      alert(
        `Lỗi khi cập nhật trạng thái khóa: ${
          error instanceof Error ? error.message : "Lỗi không xác định"
        }`
      );
    }
  }

  async function toggleReady() {
    // Chỉ leader mới có thể đánh dấu sẵn sàng
    if (!isLeader) {
      alert("Chỉ nhóm trưởng mới có thể đánh dấu nhóm sẵn sàng");
      return;
    }

    if (!groupId) {
      alert("Không tìm thấy ID nhóm");
      return;
    }

    try {
      setUpdatingReady(true);
      const currentIsReady = group?.isReady ?? false;
      const newIsReady = currentIsReady ? 0 : 1; // 0 = NotReady, 1 = Ready

      await GroupService.updateGroupIsReady(groupId, newIsReady as 0 | 1);

      // Reload group từ server để đảm bảo có giá trị isReady mới nhất từ database
      await loadGroup();
    } catch (error) {
      console.error("Error updating ready status:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Lỗi không xác định";

      // Handle specific error cases
      if (
        errorMessage.includes("401") ||
        errorMessage.includes("Unauthorized")
      ) {
        alert(
          "Bạn không có quyền thực hiện hành động này. Vui lòng đăng nhập lại."
        );
        router.push("/login");
      } else if (
        errorMessage.includes("404") ||
        errorMessage.includes("Not Found")
      ) {
        alert("Không tìm thấy nhóm. Vui lòng làm mới trang.");
        await loadGroup();
      } else {
        alert(`Lỗi khi cập nhật trạng thái sẵn sàng: ${errorMessage}`);
      }
    } finally {
      setUpdatingReady(false);
    }
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {group?.groupName || "Nhóm"}
            </h1>
            <p className="text-gray-600 mt-1">
              Môn học: {group?.courseCode || "—"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              className={`border ${
                !group?.status || group.status === "open"
                  ? "bg-gray-100 text-gray-700 border-gray-300"
                  : group.status.toLowerCase() === "approved" ||
                    group.status.toLowerCase() === "approve"
                  ? "bg-green-100 text-green-800 border-green-300"
                  : group.status.toLowerCase() === "rejected" ||
                    group.status.toLowerCase() === "reject"
                  ? "bg-red-100 text-red-800 border-red-300"
                  : group.status.toLowerCase() === "pending"
                  ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                  : "bg-blue-100 text-blue-800 border-blue-300"
              }`}
            >
              {group?.status || "open"}
            </Badge>
            {group?.isReady !== undefined && (
              <Badge
                className={`border flex items-center gap-1.5 ${
                  group.isReady
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-orange-100 text-orange-800 border-orange-300"
                }`}
              >
                {group.isReady ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" /> Sẵn sàng
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3" /> Chưa sẵn sàng
                  </>
                )}
              </Badge>
            )}
            {isLeader ? (
              <Button variant="outline" onClick={toggleLock}>
                {String(group?.status || "").toLowerCase() === "finalize" ? (
                  <Unlock className="w-4 h-4 mr-2" />
                ) : (
                  <Lock className="w-4 h-4 mr-2" />
                )}{" "}
                {String(group?.status || "").toLowerCase() === "finalize"
                  ? "Mở khoá"
                  : "Khoá nhóm"}
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin Đề tài</CardTitle>
                <CardDescription>
                  {group?.topic ? "Đề tài đã đăng ký" : "Chưa có đề tài"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-6 bg-accent animate-pulse rounded" />
                    <div className="h-20 bg-accent animate-pulse rounded" />
                  </div>
                ) : group?.topic ? (
                  <div className="space-y-2">
                    <div className="text-lg font-semibold">
                      {group.topic?.topicName}
                    </div>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {group.topic?.description || "—"}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">Chưa có đề tài</div>
                    {isLeader ? (
                      <Button onClick={openTopicDialog}>
                        <Pencil className="w-4 h-4 mr-2" /> Đăng ký đề tài
                      </Button>
                    ) : null}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thành viên nhóm</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-10 bg-accent animate-pulse rounded" />
                    <div className="h-10 bg-accent animate-pulse rounded" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Thành viên</TableHead>
                          <TableHead>Ngành</TableHead>
                          <TableHead>Vai trò</TableHead>
                          <TableHead className="text-right">
                            Hành động
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(group?.members || []).map((m: any) => (
                          <TableRow key={m.userId}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <img
                                  src={m.avatarUrl || "/placeholder-user.jpg"}
                                  className="w-8 h-8 rounded-full"
                                  alt="avatar"
                                />
                                <div>
                                  <div className="font-medium flex items-center gap-1">
                                    {m.fullName}
                                    {String(
                                      m.roleInGroup || m.role || ""
                                    ).toLowerCase() === "leader" ? (
                                      <Crown className="w-4 h-4 text-amber-500" />
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{m.major}</TableCell>
                            <TableCell>{m.roleInGroup || m.role}</TableCell>
                            <TableCell className="text-right">
                              {(() => {
                                const memberRoleInGroup = String(
                                  m.roleInGroup || m.role || ""
                                ).toLowerCase();
                                const isMemberLeader =
                                  memberRoleInGroup === "leader";
                                const memberUserId = String(m.userId || "");
                                const currentUserId = String(
                                  user?.userId || ""
                                );
                                const isCurrentUser =
                                  memberUserId === currentUserId;

                                const shouldShowKick =
                                  isLeader && !isMemberLeader && !isCurrentUser;

                                return shouldShowKick ? (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                      setKickMember(m);
                                      setKickOpen(true);
                                    }}
                                  >
                                    <UserMinus className="w-4 h-4 mr-1" /> Kick
                                  </Button>
                                ) : null;
                              })()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {isLeader &&
                    (group?.memberCount || 0) < (group?.maxMembers || 0) ? (
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setInviteOpen(true);
                            setCandidates([]);
                            setInviteQuery("");
                          }}
                        >
                          <UserPlus className="w-4 h-4 mr-2" /> Mời thành viên
                        </Button>
                      </div>
                    ) : null}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" /> Thông tin chung
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">Mentor</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {group?.lecturerName || "—"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">Môn học</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {group?.courseCode || "—"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">
                      Trạng thái
                    </p>
                    <Badge
                      className={`border ${
                        !group?.status || group.status === "open"
                          ? "bg-gray-100 text-gray-700 border-gray-300"
                          : group.status.toLowerCase() === "approved" ||
                            group.status.toLowerCase() === "approve"
                          ? "bg-green-100 text-green-800 border-green-300"
                          : group.status.toLowerCase() === "rejected" ||
                            group.status.toLowerCase() === "reject"
                          ? "bg-red-100 text-red-800 border-red-300"
                          : group.status.toLowerCase() === "pending"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                          : "bg-blue-100 text-blue-800 border-blue-300"
                      }`}
                    >
                      {group?.status || "open"}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">
                      Sẵn sàng
                    </p>
                    <Badge
                      className={`border flex items-center gap-1.5 w-fit ${
                        group?.isReady
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-orange-100 text-orange-800 border-orange-300"
                      }`}
                    >
                      {group?.isReady ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Sẵn sàng
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" /> Chưa sẵn sàng
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {isLeader && (
                  <Button
                    variant={group?.isReady ? "default" : "outline"}
                    onClick={toggleReady}
                    disabled={updatingReady}
                    className={`w-full ${
                      group?.isReady
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "border-orange-300 text-orange-700 hover:bg-orange-50"
                    }`}
                  >
                    {group?.isReady ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {updatingReady
                          ? "Đang cập nhật..."
                          : "Nhóm đã sẵn sàng"}
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        {updatingReady
                          ? "Đang cập nhật..."
                          : "Đánh dấu sẵn sàng"}
                      </>
                    )}
                  </Button>
                )}
                {isLeader &&
                (group?.memberCount || 0) < (group?.maxMembers || 0) ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setInviteOpen(true);
                      setCandidates([]);
                      setInviteQuery("");
                    }}
                    className="w-full"
                  >
                    <UserPlus className="w-4 h-4 mr-2" /> Mời thành viên
                  </Button>
                ) : null}
                <Button
                  variant="destructive"
                  onClick={() => {
                    // If current user is leader and there are other members, require transfer first
                    const memberCount = group?.members
                      ? group.members.length
                      : group?.memberCount || 0;
                    if (isLeader && memberCount > 1) {
                      setTransferOpen(true);
                    } else {
                      setLeaveOpen(true);
                    }
                  }}
                  className="w-full"
                >
                  Rời nhóm
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={topicOpen} onOpenChange={setTopicOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cập nhật Đề tài</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                placeholder="Tên đề tài"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
              />
              <Textarea
                rows={4}
                placeholder="Mô tả"
                value={topicDesc}
                onChange={(e) => setTopicDesc(e.target.value)}
              />
              {topics.length > 0 && (
                <div className="text-xs text-gray-600">
                  Có thể nhập chính xác tên đề tài trong danh sách để gắn nhanh.
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTopicOpen(false)}>
                Huỷ
              </Button>
              <Button onClick={saveTopic}>Lưu</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mời thành viên</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                placeholder="Tìm theo tên/email"
                value={inviteQuery}
                onChange={(e) => setInviteQuery(e.target.value)}
              />
              <div className="flex justify-end">
                <Button variant="outline" onClick={searchCandidates}>
                  Tìm
                </Button>
              </div>
              <div className="space-y-2 max-h-64 overflow-auto">
                {candidates.length === 0 ? (
                  <div className="text-sm text-gray-600">Chưa có kết quả</div>
                ) : (
                  candidates.map((c) => (
                    <div
                      key={String(c?.user?.id || c?.userId)}
                      className="flex items-center justify-between"
                    >
                      <div className="text-sm">
                        {c?.userProfileViewModel?.fullName ||
                          c?.user?.username ||
                          c?.user?.email}
                      </div>
                      <Button
                        size="sm"
                        disabled={inviting}
                        onClick={() => inviteUser(c)}
                      >
                        <UserPlus className="w-4 h-4 mr-1" /> Mời
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog open={leaveOpen} onOpenChange={setLeaveOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Rời nhóm?</AlertDialogTitle>
              <AlertDialogDescription>
                Hành động này sẽ xoá bạn khỏi nhóm hiện tại.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Huỷ</AlertDialogCancel>
              <AlertDialogAction onClick={handleLeave}>
                Xác nhận
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Transfer leader dialog: required when current user is leader and group has other members */}
        <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chuyển nhượng Trưởng nhóm</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="text-sm">
                Bạn là Trưởng nhóm. Trước khi rời nhóm, vui lòng chuyển nhượng
                quyền Trưởng cho một thành viên khác.
              </div>
              <div className="space-y-2 max-h-64 overflow-auto">
                {(group?.members || [])
                  .filter((m: any) => String(m.userId) !== String(user?.userId))
                  .map((m: any) => (
                    <div
                      key={m.userId}
                      className="flex items-center justify-between p-2 rounded hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={m.avatarUrl || "/placeholder-user.jpg"}
                          className="w-8 h-8 rounded-full"
                          alt="avatar"
                        />
                        <div>
                          <div className="font-medium">
                            {m.fullName || m.username || m.email}
                          </div>
                          <div className="text-xs text-gray-500">
                            {m.major || ""}
                          </div>
                        </div>
                      </div>
                      <div>
                        <input
                          type="radio"
                          name="newLeader"
                          value={m.userId}
                          checked={newLeaderId === String(m.userId)}
                          onChange={() => setNewLeaderId(String(m.userId))}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTransferOpen(false)}>
                Huỷ
              </Button>
              <Button
                disabled={!newLeaderId || transferSubmitting}
                onClick={handleTransferAndLeave}
              >
                {transferSubmitting ? "Đang xử lý..." : "Chuyển và Rời"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={kickOpen} onOpenChange={setKickOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Kick thành viên?</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc muốn kick {kickMember?.fullName} khỏi nhóm không?
                Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setKickMember(null)}>
                Huỷ
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleKick}>
                Xác nhận kick
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
