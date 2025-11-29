"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Users,
  User,
  Mail,
  Code2,
  BookOpen,
  UserPlus,
  Search,
  AlertCircle,
  X,
} from "lucide-react";
import { getCurrentUser } from "@/lib/utils/auth";
import { useToast } from "@/lib/hooks/use-toast";
import { GroupService } from "@/lib/api/groupService";
import type { Group } from "@/lib/types";
import type { StudentWithoutGroup } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function GroupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<any>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [addingMember, setAddingMember] = useState<boolean>(false);
  const [studentsWithoutGroup, setStudentsWithoutGroup] = useState<
    StudentWithoutGroup[]
  >([]);
  const [studentSearch, setStudentSearch] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    member: any | null;
  }>({
    open: false,
    member: null,
  });
  const [errorDialog, setErrorDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({
    open: false,
    title: "",
    message: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== "lecturer") {
      router.push("/login");
      return;
    }
    setUser(currentUser);

    const groupId = params.groupId as string;

    const loadGroup = async () => {
      try {
        setLoading(true);
        const data = await GroupService.getGroupById(groupId);
        if (!data) {
          toast({ title: "Lỗi", description: "Không tìm thấy nhóm" });
          router.push("/lecturer/groups");
          return;
        }
        setGroup(data);
      } catch (error) {
        console.error("Error loading group detail:", error);
        toast({ title: "Lỗi", description: "Không thể tải chi tiết nhóm" });
        router.push("/lecturer/groups");
      } finally {
        setLoading(false);
      }
    };

    const loadStudentsWithoutGroup = async () => {
      try {
        const response = await fetch("/api/students-without-group", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`HTTP status ${response.status}`);
        }

        const data = (await response.json()) as StudentWithoutGroup[];
        setStudentsWithoutGroup(data);
      } catch (error) {
        console.error("Error loading students without group:", error);
      }
    };

    loadGroup();
    loadStudentsWithoutGroup();
  }, [router, params.groupId, toast]);

  const handleOpenAddDialog = () => {
    setSelectedStudentId("");
    setStudentSearch("");
    setOpenAddDialog(true);
  };

  const handleAddMember = async () => {
    if (!group) return;
    if (!selectedStudentId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn một sinh viên cần thêm",
        variant: "destructive",
      });
      return;
    }

    // Kiểm tra giới hạn thành viên trước khi gọi API
    if (group.maxMembers !== null && group.members.length >= group.maxMembers) {
      const errorMsg = `Nhóm đã đạt số lượng thành viên tối đa.\n\nSố thành viên hiện tại: ${group.members.length} / ${group.maxMembers}`;

      toast({
        title: "Không thể thêm thành viên",
        description: errorMsg,
        variant: "destructive",
      });

      // Hiển thị error dialog
      setErrorDialog({
        open: true,
        title: "Không thể thêm thành viên",
        message: errorMsg,
      });
      return;
    }

    try {
      setAddingMember(true);
      await GroupService.addMemberToGroupViaApi({
        userId: selectedStudentId,
        groupId: group.groupId,
      });

      toast({
        title: "Thêm thành viên thành công",
        description: "Sinh viên đã được thêm vào nhóm",
      });

      // Refresh group detail to see new member list
      const updated = await GroupService.getGroupById(group.groupId);
      if (updated) {
        setGroup(updated);
      }

      // Remove this student from local "without group" list
      setStudentsWithoutGroup((prev) =>
        prev.filter((s) => s.studentId !== selectedStudentId)
      );

      setOpenAddDialog(false);
    } catch (error) {
      // Xử lý lỗi đặc biệt cho trường hợp đạt giới hạn thành viên
      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : "Không thể thêm sinh viên vào nhóm";

      const isMaxMembersError =
        errorMessage.includes("đạt số lượng thành viên tối đa") ||
        errorMessage.includes("giới hạn thành viên") ||
        errorMessage.includes("max members") ||
        errorMessage.toLowerCase().includes("maximum") ||
        errorMessage.toLowerCase().includes("limit");

      if (isMaxMembersError) {
        const maxMembersText = group.maxMembers
          ? `\n\nSố thành viên hiện tại: ${group.members.length} / ${group.maxMembers}`
          : "";

        // Hiển thị toast
        toast({
          title: "Không thể thêm thành viên",
          description: `Nhóm đã đạt số lượng thành viên tối đa.${maxMembersText}`,
          variant: "destructive",
        });

        // Hiển thị error dialog để đảm bảo người dùng thấy lỗi
        setErrorDialog({
          open: true,
          title: "Không thể thêm thành viên",
          message: `Nhóm đã đạt số lượng thành viên tối đa.${maxMembersText}`,
        });
      } else {
        // Hiển thị toast
        toast({
          title: "Lỗi",
          description: errorMessage,
          variant: "destructive",
        });

        // Hiển thị error dialog
        setErrorDialog({
          open: true,
          title: "Lỗi khi thêm thành viên",
          message: errorMessage,
        });
      }
    } finally {
      setAddingMember(false);
    }
  };

  if (!user) return null;
  if (loading || !group) {
    return (
      <DashboardLayout role="lecturer">
        <div className="p-6 text-gray-600">Đang tải chi tiết nhóm...</div>
      </DashboardLayout>
    );
  }

  const statusColor =
    group.status === "open"
      ? "bg-green-100 text-green-700"
      : "bg-gray-100 text-gray-700";

  const filteredStudentsForSelect = studentsWithoutGroup.filter((s) => {
    if (!studentSearch) return true;
    const term = studentSearch.toLowerCase();
    return (
      s.userProfileViewModel.fullName.toLowerCase().includes(term) ||
      s.user.email.toLowerCase().includes(term)
    );
  });

  return (
    <DashboardLayout role="lecturer">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/lecturer/groups")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
            <p className="text-gray-600 mt-1 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              {group.courseName}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Thông tin nhóm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Trạng thái</p>
                <Badge className={statusColor}>
                  {group.status ? group.status : "Chưa cập nhật"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Số thành viên</p>
                <p className="font-semibold">
                  {group.members.length}
                  {group.maxMembers ? ` / ${group.maxMembers}` : ""}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Chủ đề</p>
                <p className="font-semibold">
                  {group.topicName || "Chưa có chủ đề"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Thành viên nhóm
            </CardTitle>
            <CardDescription>
              Danh sách thành viên, email và kỹ năng trong nhóm
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex justify-end">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={handleOpenAddDialog}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Thêm sinh viên chưa có nhóm
              </Button>
            </div>
            {group.members.length === 0 ? (
              <p className="text-gray-600">Nhóm hiện chưa có thành viên nào.</p>
            ) : (
              <div className="space-y-4">
                {group.members.map((member: any) => (
                  <Card
                    key={member.userId}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">
                                {member.fullName}
                              </h3>
                              {member.roleInGroup && (
                                <Badge
                                  variant="outline"
                                  className="text-xs capitalize"
                                >
                                  {member.roleInGroup}
                                </Badge>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setDeleteDialog({
                                  open: true,
                                  member: member,
                                });
                              }}
                            >
                              Xóa khỏi nhóm
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {member.email}
                          </p>
                          {member.skillSet && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Code2 className="w-4 h-4 text-gray-500" />
                              <span>Kỹ năng: {member.skillSet}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm sinh viên chưa có nhóm</DialogTitle>
              <DialogDescription>
                Chọn một sinh viên từ danh sách sinh viên chưa có nhóm để thêm
                vào nhóm hiện tại.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Tìm kiếm sinh viên
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Nhập tên hoặc email "
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Chọn sinh viên
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">-- Chọn sinh viên --</option>
                  {filteredStudentsForSelect.map((s) => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.userProfileViewModel.fullName} - {s.user.email}
                    </option>
                  ))}
                </select>
                {filteredStudentsForSelect.length === 0 && (
                  <p className="text-xs text-gray-500">
                    Không còn sinh viên nào chưa có nhóm hoặc không khớp từ
                    khóa.
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpenAddDialog(false)}
                disabled={addingMember}
              >
                Hủy
              </Button>
              <Button onClick={handleAddMember} disabled={addingMember}>
                {addingMember ? "Đang thêm..." : "Thêm vào nhóm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Member Dialog */}
        <Dialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold text-gray-900">
                    Xác nhận xóa thành viên
                  </DialogTitle>
                  <DialogDescription className="mt-1">
                    Hành động này không thể hoàn tác
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="pt-4 px-6 pb-2">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {deleteDialog.member?.fullName ||
                        deleteDialog.member?.username ||
                        "Thành viên"}
                    </p>
                    {deleteDialog.member?.email && (
                      <p className="text-sm text-gray-600">
                        {deleteDialog.member.email}
                      </p>
                    )}
                    {deleteDialog.member?.roleInGroup && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {deleteDialog.member.roleInGroup}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 text-sm">
                Bạn có chắc chắn muốn xóa{" "}
                <span className="font-semibold">
                  {deleteDialog.member?.fullName ||
                    deleteDialog.member?.username ||
                    "thành viên này"}
                </span>{" "}
                khỏi nhóm{" "}
                <span className="font-semibold">{group?.groupName}</span>?
              </p>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  setDeleteDialog({ ...deleteDialog, open: false })
                }
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (!deleteDialog.member) return;

                  try {
                    const groupId = params.groupId as string;
                    const memberName =
                      deleteDialog.member.fullName ||
                      deleteDialog.member.username ||
                      "Thành viên";

                    const updatedGroup =
                      await GroupService.removeMemberFromGroupViaApi({
                        memberId: deleteDialog.member.userId,
                        groupId: groupId,
                      });

                    if (updatedGroup) {
                      setGroup(updatedGroup);
                    } else {
                      // Fallback: reload the group
                      const reloadedGroup = await GroupService.getGroupById(
                        groupId
                      );
                      if (reloadedGroup) {
                        setGroup(reloadedGroup);
                      }
                    }

                    setDeleteDialog({ open: false, member: null });

                    toast({
                      title: "✅ Đã xóa thành viên khỏi nhóm",
                      description: `${memberName} đã được xóa khỏi nhóm thành công.`,
                      className: "bg-green-50 border-green-200",
                    });
                  } catch (error) {
                    console.error("Error removing member from group:", error);
                    const description =
                      error instanceof Error && error.message
                        ? error.message
                        : "Không thể xóa sinh viên khỏi nhóm";
                    toast({
                      title: "Lỗi",
                      description,
                      variant: "destructive",
                    });
                  }
                }}
              >
                Xác nhận xóa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Error Dialog */}
        <Dialog
          open={errorDialog.open}
          onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <DialogTitle className="text-red-600">
                  {errorDialog.title}
                </DialogTitle>
              </div>
            </DialogHeader>
            <div className="pt-4 px-6 pb-2">
              <p className="text-gray-700 whitespace-pre-line text-sm">
                {errorDialog.message}
              </p>
            </div>
            <DialogFooter>
              <Button
                onClick={() => setErrorDialog({ ...errorDialog, open: false })}
                className="bg-red-600 hover:bg-red-700"
              >
                Đã hiểu
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
