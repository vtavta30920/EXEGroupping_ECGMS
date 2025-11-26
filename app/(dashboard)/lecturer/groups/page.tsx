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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Users, Filter, BookOpen, ListChecks, Search } from "lucide-react";
import { getCurrentUser } from "@/lib/utils/auth";
import { useToast } from "@/lib/hooks/use-toast";
import { GroupService, type ApiGroup } from "@/lib/api/groupService";

interface GroupsByCourse {
  courseName: string;
  courseId: string;
  groups: ApiGroup[];
}

export default function GroupsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [groups, setGroups] = useState<ApiGroup[]>([]);
  const [groupsByCourse, setGroupsByCourse] = useState<GroupsByCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(9);
  const { toast } = useToast();

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

      const grouped = Object.values(
        data.reduce<Record<string, GroupsByCourse>>((acc, group) => {
          if (!acc[group.courseId]) {
            acc[group.courseId] = {
              courseId: group.courseId,
              courseName: group.courseName || group.courseCode || "N/A",
              groups: [],
            };
          }
          acc[group.courseId].groups.push(group);
          return acc;
        }, {})
      ).sort((a, b) => {
        const nameA = a.courseName || "";
        const nameB = b.courseName || "";
        return nameA.localeCompare(nameB);
      });

      setGroupsByCourse(grouped);
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

  // Data for "Theo môn học" tab (không áp dụng filter phân trang để giữ overview rõ ràng)
  const visibleGroupsByCourse =
    selectedCourse === "all"
      ? groupsByCourse
      : groupsByCourse.filter((c) => c.courseId === selectedCourse);

  // Data cho tab "Tất cả nhóm" với filter + pagination
  const filteredGroups = groups.filter((group) => {
    // Filter theo trạng thái
    if (statusFilter === "active" && group.status !== "active") return false;
    if (statusFilter === "inactive" && group.status === "active") return false;
    if (statusFilter === "no-status" && group.status !== null) return false;

    // Filter theo từ khóa
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesName = group.name.toLowerCase().includes(term);
      const matchesTopic =
        group.topicName && group.topicName.toLowerCase().includes(term);
      const matchesCourse =
        group.courseName && group.courseName.toLowerCase().includes(term);

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Nhóm theo môn học
            </h1>
            <p className="text-gray-600 mt-1">
              Xem danh sách nhóm của các môn học và chi tiết thành viên
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Tất cả môn học</option>
                {groupsByCourse.map((course) => (
                  <option key={course.courseId} value={course.courseId}>
                    {course.courseName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tổng quan */}
        <Card>
          <CardContent className="p-4 flex flex-wrap gap-6 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng số nhóm</p>
                <p className="text-2xl font-bold">{groups.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <ListChecks className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng số thành viên</p>
                <p className="text-2xl font-bold">
                  {groups.reduce((sum, g) => sum + g.members.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="by-course">
          <TabsList>
            <TabsTrigger value="by-course">Theo môn học</TabsTrigger>
            <TabsTrigger value="all-groups">Tất cả nhóm</TabsTrigger>
          </TabsList>

          <TabsContent value="by-course" className="space-y-6">
            {loading ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-600">
                  Đang tải danh sách nhóm...
                </CardContent>
              </Card>
            ) : visibleGroupsByCourse.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-600">
                  Không có nhóm nào.
                </CardContent>
              </Card>
            ) : (
              visibleGroupsByCourse.map((course) => (
                <Card key={course.courseId}>
                  <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        {course.courseName}
                      </CardTitle>
                      <CardDescription>
                        Có {course.groups.length} nhóm trong môn học này
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {course.groups.length} nhóm
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {course.groups.map((group) => (
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
                              {group.status && (
                                <Badge
                                  variant="outline"
                                  className="text-xs capitalize"
                                >
                                  {group.status}
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="mt-2 text-base line-clamp-1">
                              {group.name}
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
                                Thành viên: {group.members.length}
                                {group.maxMembers
                                  ? ` / ${group.maxMembers}`
                                  : ""}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(
                                    `/lecturer/groups/${group.groupId}`
                                  );
                                }}
                              >
                                Xem chi tiết
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="all-groups">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle>Tất cả nhóm</CardTitle>
                    <CardDescription>
                      Danh sách toàn bộ nhóm trong các môn học
                    </CardDescription>
                  </div>
                  <div className="flex flex-col md:flex-row gap-3 md:items-center">
                    <div className="relative w-full md:w-64">
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
                    {/* <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Trạng thái:</span>
                      <select
                        value={statusFilter}
                        onChange={(e) => {
                          setStatusFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="all">Tất cả</option>
                        <option value="active">Active</option>
                        <option value="inactive">Không active</option>
                        <option value="no-status">Chưa có trạng thái</option>
                      </select>
                    </div> */}
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
                                  {group.courseName}
                                </Badge>
                                {group.status && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs capitalize"
                                  >
                                    {group.status}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <CardTitle className="mt-2 text-base line-clamp-1">
                              {group.name}
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
                                Thành viên: {group.members.length}
                                {group.maxMembers
                                  ? ` / ${group.maxMembers}`
                                  : ""}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(
                                    `/lecturer/groups/${group.groupId}`
                                  );
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
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
