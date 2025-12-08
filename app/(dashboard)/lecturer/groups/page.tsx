"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Users,
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { getCurrentUser } from "@/lib/utils/auth";
import { useToast } from "@/lib/hooks/use-toast";
import { GroupService } from "@/lib/api/groupService";
import type { Group } from "@/lib/types";

export default function GroupsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [readyFilter, setReadyFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(9);
  const { toast } = useToast();

  // Helper function để lấy màu sắc cho status
  const getStatusColor = (status: string | null | undefined) => {
    if (!status) return "bg-gray-100 text-gray-700 border-gray-300";
    const statusLower = status.toLowerCase();
    if (statusLower === "approved" || statusLower === "approve") {
      return "bg-green-100 text-green-800 border-green-300";
    }
    if (statusLower === "rejected" || statusLower === "reject") {
      return "bg-red-100 text-red-800 border-red-300";
    }
    if (statusLower === "pending") {
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    }
    return "bg-blue-100 text-blue-800 border-blue-300";
  };

  // Helper function để lấy màu sắc cho isReady
  const getReadyColor = (isReady: boolean | undefined) => {
    if (isReady === true) {
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
    }
    return "bg-orange-100 text-orange-800 border-orange-300";
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== "lecturer") {
      router.push("/login");
      return;
    }
    setUser(currentUser);
    loadGroups();
  }, [router]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await GroupService.getGroups();
      setGroups(data);
    } catch (error) {
      console.error("Error loading groups:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách nhóm",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  // Tính toán thống kê đơn giản (chỉ tính những gì cần thiết)
  const totalGroups = groups.length;
  const readyGroups = groups.filter((g) => g.isReady === true).length;

  // Chỉ tính nhóm sẵn sàng và chưa được phê duyệt/từ chối (pending hoặc null)
  const needsAction = groups.filter((g) => {
    if (g.isReady !== true) return false;
    const status = (g.status || "").toLowerCase();
    // Chỉ tính nhóm sẵn sàng và có status là pending hoặc null/undefined
    // Không tính nhóm đã approved hoặc rejected
    return status === "pending" || !g.status;
  }).length;

  const approvedGroups = groups.filter((g) => {
    const status = (g.status || "").toLowerCase();
    return status === "approved" || status === "approve";
  }).length;

  // Data với filter + pagination
  const filteredGroups = groups.filter((group) => {
    // Filter theo status
    if (statusFilter !== "all") {
      const statusLower = (group.status || "").toLowerCase();
      if (statusFilter === "pending" && statusLower !== "pending") return false;
      if (
        statusFilter === "approved" &&
        statusLower !== "approved" &&
        statusLower !== "approve"
      )
        return false;
      if (
        statusFilter === "rejected" &&
        statusLower !== "rejected" &&
        statusLower !== "reject"
      )
        return false;
      if (
        statusFilter === "no-status" &&
        group.status !== null &&
        group.status !== undefined
      )
        return false;
    }

    // Filter theo isReady
    if (readyFilter !== "all") {
      if (readyFilter === "ready" && group.isReady !== true) return false;
      if (readyFilter === "not-ready" && group.isReady !== false) return false;
    }

    // Filter theo từ khóa
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const groupName = (group.groupName || group.name || "").toLowerCase();
      const matchesName = groupName.includes(term);
      const matchesTopic = (group.topicName || "").toLowerCase().includes(term);
      const matchesCourse = (group.courseName || group.courseCode || "")
        .toLowerCase()
        .includes(term);

      if (!matchesName && !matchesTopic && !matchesCourse) {
        return false;
      }
    }

    return true;
  });

  const totalPages = Math.ceil(
    filteredGroups.length === 0 ? 1 : filteredGroups.length / itemsPerPage
  );
  const safeCurrentPage = Math.min(currentPage, totalPages || 1);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedGroups = filteredGroups.slice(startIndex, endIndex);

  return (
    <DashboardLayout role="lecturer">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý nhóm</h1>
          <p className="text-gray-600 mt-1">
            Xem danh sách nhóm và chi tiết thành viên
          </p>
        </div>

        {/* Tổng quan đơn giản */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Tổng số nhóm</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalGroups}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {needsAction > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Cần xử lý</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {needsAction}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Sẵn sàng, chờ phê duyệt
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Đã phê duyệt</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {approvedGroups}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Danh sách nhóm */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Tất cả nhóm</CardTitle>
                <CardDescription>
                  Danh sách toàn bộ nhóm trong các môn học
                </CardDescription>
              </div>
              <div className="flex flex-col gap-3">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Tìm theo tên nhóm, chủ đề, môn học..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-9"
                  />
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 whitespace-nowrap">
                      Trạng thái:
                    </span>
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                    >
                      <option value="all">Tất cả</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="no-status">Chưa có trạng thái</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 whitespace-nowrap">
                      Sẵn sàng:
                    </span>
                    <select
                      value={readyFilter}
                      onChange={(e) => {
                        setReadyFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                    >
                      <option value="all">Tất cả</option>
                      <option value="ready">Sẵn sàng</option>
                      <option value="not-ready">Chưa sẵn sàng</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="p-6 text-center text-gray-600">
                Đang tải danh sách nhóm...
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="p-6 text-center text-gray-600">
                Không có nhóm nào phù hợp với bộ lọc.
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4 text-sm text-gray-600 flex-wrap gap-2">
                  <span>
                    Hiển thị {startIndex + 1}-
                    {Math.min(endIndex, filteredGroups.length)} trong tổng{" "}
                    {filteredGroups.length} nhóm
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Hiển thị:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                    >
                      <option value={6}>6</option>
                      <option value={9}>9</option>
                      <option value={12}>12</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedGroups.map((group) => (
                    <Card
                      key={group.groupId}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() =>
                        router.push(`/lecturer/groups/${group.groupId}`)
                      }
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                          <div className="bg-orange-100 p-2 rounded-lg">
                            <Users className="w-5 h-5 text-orange-600" />
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge
                              variant="outline"
                              className="text-xs line-clamp-1 max-w-[140px]"
                            >
                              {group.courseName || group.courseCode || "N/A"}
                            </Badge>
                            {group.isReady !== undefined && (
                              <Badge
                                className={`text-xs flex items-center gap-1 border ${getReadyColor(
                                  group.isReady
                                )}`}
                              >
                                {group.isReady ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3" /> Sẵn
                                    sàng
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-3 h-3" /> Chưa sẵn
                                    sàng
                                  </>
                                )}
                              </Badge>
                            )}
                            {group.status && (
                              <Badge
                                className={`text-xs capitalize border ${getStatusColor(
                                  group.status
                                )}`}
                              >
                                {group.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <CardTitle className="mt-2 text-base line-clamp-1">
                          {group.groupName || group.name || "Chưa đặt tên"}
                        </CardTitle>
                        {group.topicName && (
                          <CardDescription className="line-clamp-1">
                            Chủ đề: {group.topicName}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>
                            Thành viên: {group.members?.length || 0}
                            {group.maxMembers ? ` / ${group.maxMembers}` : ""}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/lecturer/groups/${group.groupId}`);
                            }}
                          >
                            Xem chi tiết
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Trang {safeCurrentPage} / {totalPages}
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (safeCurrentPage > 1) {
                                setCurrentPage(safeCurrentPage - 1);
                              }
                            }}
                            className={
                              safeCurrentPage === 1
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>

                        {safeCurrentPage > 2 && (
                          <>
                            <PaginationItem>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPage(1);
                                }}
                                className="cursor-pointer"
                              >
                                1
                              </PaginationLink>
                            </PaginationItem>
                            {safeCurrentPage > 3 && (
                              <PaginationItem>
                                <PaginationEllipsis />
                              </PaginationItem>
                            )}
                          </>
                        )}

                        {safeCurrentPage > 1 && (
                          <PaginationItem>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(safeCurrentPage - 1);
                              }}
                              className="cursor-pointer"
                            >
                              {safeCurrentPage - 1}
                            </PaginationLink>
                          </PaginationItem>
                        )}

                        <PaginationItem>
                          <PaginationLink href="#" isActive>
                            {safeCurrentPage}
                          </PaginationLink>
                        </PaginationItem>

                        {safeCurrentPage < totalPages && (
                          <PaginationItem>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(safeCurrentPage + 1);
                              }}
                              className="cursor-pointer"
                            >
                              {safeCurrentPage + 1}
                            </PaginationLink>
                          </PaginationItem>
                        )}

                        {safeCurrentPage < totalPages - 1 && (
                          <>
                            {safeCurrentPage < totalPages - 2 && (
                              <PaginationItem>
                                <PaginationEllipsis />
                              </PaginationItem>
                            )}
                            <PaginationItem>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPage(totalPages);
                                }}
                                className="cursor-pointer"
                              >
                                {totalPages}
                              </PaginationLink>
                            </PaginationItem>
                          </>
                        )}

                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (safeCurrentPage < totalPages) {
                                setCurrentPage(safeCurrentPage + 1);
                              }
                            }}
                            className={
                              safeCurrentPage === totalPages
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
