"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GroupTaskService } from "@/lib/api/groupTaskService";
import { TaskService } from "@/lib/api/taskService";
import { getCurrentUser } from "@/lib/utils/auth";
import type { GroupMember, Task, TaskPriority, User } from "@/lib/types";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaskStats from "@/components/features/tasks/TaskStats";
import TaskList from "@/components/features/tasks/TaskList";
import TaskKanban from "@/components/features/tasks/TaskKanban";
import CreateTaskDialog from "@/components/features/tasks/CreateTaskDialog";
import TaskDetailSheet from "@/components/features/tasks/TaskDetailSheet";
import { GroupMemberService as GeneratedGroupMemberService } from "@/lib/api/generated";

type Filters = { status?: Task["status"] | ""; priority?: TaskPriority | "" };
type AssigneeScope = "me" | "group";

export default function StudentTasksPage() {
  const router = useRouter();
  // Avoid SSR hydration mismatches by resolving user on client after mount
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  useEffect(() => {
    setMounted(true);
    setCurrentUser(getCurrentUser() as User | null);
  }, []);
  const studentId = currentUser?.userId;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [assigneeScope, setAssigneeScope] = useState<AssigneeScope>("me");

  // Create Task modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    taskName: "",
    description: "",
    dueDate: "",
    priority: "medium" as TaskPriority,
    assigneeUserId: "",
  });
  const canCreate = Boolean(currentUser?.groupId && studentId);
  const [members, setMembers] = useState<GroupMember[]>([]);

  // Detail sheet state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<Task | null>(null);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const byStatus = filters.status ? t.status === filters.status : true;
      const byPriority = filters.priority ? t.priority === filters.priority : true;
      return byStatus && byPriority;
    });
  }, [tasks, filters]);

  async function loadTasks() {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      let ts: Task[] = [];
      // Fallback to group-level tasks since Student endpoint is not implemented
      if (currentUser?.groupId) {
        ts = await TaskService.getTasksByGroupId(currentUser.groupId);
        if (assigneeScope === "me" && studentId) {
          ts = ts.filter(t => t.assignedToId === studentId);
        }
      }
      setTasks(ts);
    } catch (e: any) {
      setError(e?.message || "Không thể tải danh sách task");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, filters.status, filters.priority, assigneeScope]);

  // Load group members for assignee dropdown
  useEffect(() => {
    async function loadMembers() {
      if (!currentUser?.groupId) { setMembers([]); return; }
      try {
        const ms = await GeneratedGroupMemberService.getApiGroupMember({ groupId: currentUser.groupId });
        const normalized = (ms || []).map(m => ({
          userId: (m as any).userId || (m as any).studentId || (m as any).id || "",
          fullName: (m as any).username || (m as any).studentName || (m as any).fullName || "Thành viên",
          role: ((m as any).roleInGroup === 'Leader' || (m as any).roleInGroup === 'Group Leader') ? 'leader' : 'member',
          major: 'SE',
        })) as GroupMember[];
        setMembers(normalized);
      } catch {
        setMembers([]);
      }
    }
    loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.groupId]);

  async function handleCreateTask() {
    if (!canCreate) return;
    if (!createForm.assigneeUserId) { alert("Vui lòng chọn người được giao"); return; }
    try {
      setLoading(true);
      await GroupTaskService.createTask({
        groupId: currentUser!.groupId!,
        taskName: createForm.taskName,
        description: createForm.description,
        assigneeUserId: createForm.assigneeUserId,
        dueDate: createForm.dueDate ? new Date(createForm.dueDate).toISOString() : undefined,
        priority: createForm.priority,
      });
      await loadTasks();
      setCreateOpen(false);
      setCreateForm({ taskName: "", description: "", dueDate: "", priority: "medium", assigneeUserId: "" });
    } catch (e: any) {
      alert(e?.message || "Tạo task thất bại");
    } finally {
      setLoading(false);
    }
  }

  function openDetail(t: Task) {
    setDetailTask(t);
    setDetailOpen(true);
  }

  async function handleUpdateDetail(payload: { status: Task["status"]; progressPercent: number; remarks: string }) {
    if (!detailTask) return;
    try {
      setLoading(true);
      await GroupTaskService.updateTaskProgress(detailTask.taskId, {
        status: payload.status,
        progressPercent: payload.progressPercent,
        remarks: payload.remarks,
      });
      await loadTasks();
      setDetailOpen(false);
      setDetailTask(null);
    } catch (e: any) {
      alert(e?.message || "Cập nhật tiến độ thất bại");
    } finally {
      setLoading(false);
    }
  }

  async function handleMoveStatus(task: Task, nextStatus: Task["status"]) {
    try {
      setLoading(true);
      await GroupTaskService.updateTaskProgress(task.taskId, { status: nextStatus });
      await loadTasks();
    } catch (e: any) {
      alert(e?.message || "Chuyển trạng thái thất bại");
    } finally {
      setLoading(false);
    }
  }

  const hasGroup = Boolean(currentUser?.groupId);

  // Render nothing until mounted to ensure server and client markup match
  if (!mounted) {
    return null;
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        {!hasGroup && (
          <Card>
            <CardContent className="p-8 text-center space-y-3">
              <h2 className="text-2xl font-semibold">Bạn chưa tham gia nhóm nào</h2>
              <p className="text-muted-foreground">Hãy tham gia nhóm để bắt đầu quản lý công việc cùng mọi người.</p>
              <Button onClick={() => router.push("/student/group")}>Tham gia nhóm ngay</Button>
            </CardContent>
          </Card>
        )}

        {hasGroup && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Quản lý công việc</h1>
                <p className="text-gray-600 mt-1">Chế độ xem List/Kanban với bộ lọc nâng cao.</p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={assigneeScope} onValueChange={(v) => setAssigneeScope(v as AssigneeScope)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Phạm vi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="me">Của tôi</SelectItem>
                    <SelectItem value="group">Cả nhóm</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.status || ""} onValueChange={(v) => setFilters(f => ({ ...f, status: (v === 'all' ? '' : v) as Task["status"] }))}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Lọc trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="pending">Chờ làm</SelectItem>
                    <SelectItem value="in-progress">Đang làm</SelectItem>
                    <SelectItem value="graded">Hoàn thành</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.priority || ""} onValueChange={(v) => setFilters(f => ({ ...f, priority: (v === 'all' ? '' : v) as TaskPriority }))}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Lọc ưu tiên" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="low">Thấp</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="high">Cao</SelectItem>
                  </SelectContent>
                </Select>

                <CreateTaskDialog
                  open={createOpen}
                  onOpenChange={setCreateOpen}
                  canCreate={canCreate}
                  members={members}
                  form={createForm}
                  setForm={(updater) => setCreateForm(prev => updater(prev))}
                  onSubmit={handleCreateTask}
                  loading={loading}
                />
              </div>
            </div>

            <TaskStats tasks={tasks} currentUserId={studentId} />

            <Tabs defaultValue="list" className="mt-2">
              <TabsList>
                <TabsTrigger value="list">List</TabsTrigger>
                <TabsTrigger value="kanban">Kanban</TabsTrigger>
              </TabsList>
              <TabsContent value="list" className="pt-2">
                <TaskList tasks={filteredTasks} onOpenTask={openDetail} onUpdateProgress={(t) => openDetail(t)} />
              </TabsContent>
              <TabsContent value="kanban" className="pt-2">
                <TaskKanban tasks={filteredTasks} onOpenTask={openDetail} onMoveStatus={handleMoveStatus} />
              </TabsContent>
            </Tabs>

            <TaskDetailSheet open={detailOpen} onOpenChange={setDetailOpen} task={detailTask} members={members} onUpdate={handleUpdateDetail} />
          </>
        )}
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4 text-destructive">{error}</CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
