// lib/mock-data/groupTasks.ts
// Mock dữ liệu và hàm mô phỏng API GroupTask cho STUDENT, bám sát Swagger
import type { Task, TaskPriority, TaskStatus } from "@/lib/types";

type CreateTaskPayload = {
  groupId: string;
  taskName: string;
  description?: string;
  assigneeUserId: string;
  dueDate?: string; // ISO string
  priority?: string | number; // API có thể gửi string/number
};

type UpdateProgressPayload = {
  status?: string; // pending | in-progress | completed | ...
  progressPercent?: number;
  remarks?: string;
};

// Mô phỏng cấu trúc TaskDetail từ Swagger
interface MockTaskDetail {
  id: string; // taskDetailId
  taskId: string; // liên kết với task gốc
  groupId: string;
  assignTo: string; // userId
  status: string; // pending | in-progress | completed
  progressPercent: number;
  startDate?: string;
  dueDate?: string;
  completedAt?: string;
  remarks?: string;
  createdAt: string;
  updatedAt?: string;
  // thông tin hiển thị phụ trợ cho FE
  groupName?: string;
  assignedToName?: string;
  task: {
    id: string;
    title: string;
    description?: string;
    priority?: number | string | null;
    status?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
}

// Bộ nhớ giả lập cho Mock - scope module
const mockTaskStore: MockTaskDetail[] = [
  {
    id: "d-0001",
    taskId: "t-0001",
    groupId: "G-EXE101-01",
    groupName: "Nhóm EXE101-01",
    assignTo: "S001",
    assignedToName: "Nguyễn Văn A",
    status: "in-progress",
    progressPercent: 40,
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    task: {
      id: "t-0001",
      title: "Thiết kế wireframe",
      description: "Phác thảo bố cục trang chủ và trang chi tiết",
      priority: 1,
      status: "in-progress",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  {
    id: "d-0002",
    taskId: "t-0002",
    groupId: "G-EXE101-01",
    groupName: "Nhóm EXE101-01",
    assignTo: "S001",
    assignedToName: "Nguyễn Văn A",
    status: "pending",
    progressPercent: 10,
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    task: {
      id: "t-0002",
      title: "Cấu hình CI",
      description: "Thiết lập pipeline build và test tự động",
      priority: 2,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  {
    id: "d-0003",
    taskId: "t-0003",
    groupId: "G-EXE101-02",
    groupName: "Nhóm EXE101-02",
    assignTo: "S002",
    assignedToName: "Trần Thị B",
    status: "completed",
    progressPercent: 100,
    dueDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    task: {
      id: "t-0003",
      title: "Viết tài liệu API",
      description: "Hoàn thiện README và hướng dẫn tích hợp",
      priority: 3,
      status: "completed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  {
    id: "d-0004",
    taskId: "t-0004",
    groupId: "G-EXE102-01",
    groupName: "Nhóm EXE102-01",
    assignTo: "S001",
    assignedToName: "Nguyễn Văn A",
    status: "pending",
    progressPercent: 0,
    dueDate: new Date(Date.now() + 10 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    task: {
      id: "t-0004",
      title: "Lập kế hoạch sprint",
      description: "Tạo backlog và ước lượng điểm cho sprint 1",
      priority: 1,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  {
    id: "d-0005",
    taskId: "t-0005",
    groupId: "G-EXE101-03",
    groupName: "Nhóm EXE101-03",
    assignTo: "S003",
    assignedToName: "Lê Văn C",
    status: "in-progress",
    progressPercent: 30,
    dueDate: new Date(Date.now() + 1 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    task: {
      id: "t-0005",
      title: "Kiểm thử chức năng đăng nhập",
      description: "Viết test case và báo cáo lỗi nếu có",
      priority: 2,
      status: "in-progress",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  {
    id: "d-0006",
    taskId: "t-0006",
    groupId: "G-EXE102-02",
    groupName: "Nhóm EXE102-02",
    assignTo: "S001",
    assignedToName: "Nguyễn Văn A",
    status: "pending",
    progressPercent: 0,
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    task: {
      id: "t-0006",
      title: "Tối ưu performance trang danh sách",
      description: "Sử dụng virtualization cho list dài",
      priority: 3,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
];

function mapStatus(s?: string | null): TaskStatus {
  const v = (s || "").toLowerCase();
  if (v === "done" || v === "completed") return "completed";
  if (v === "inprogress" || v === "in-progress") return "in-progress";
  return "pending";
}

function mapPriority(p?: string | number | null): TaskPriority {
  if (p === 1 || p === "1" || p === "high") return "high";
  if (p === 2 || p === "2" || p === "medium") return "medium";
  return "low";
}

function toTask(detail: MockTaskDetail): Task {
  return {
    taskId: detail.id, // dùng taskDetailId để tương thích UpdateProgress
    taskName: detail.task?.title || "Task",
    description: detail.task?.description || "",
    groupId: detail.groupId,
    groupName: detail.groupName || "",
    assignedTo: detail.assignedToName || "",
    assignedToId: detail.assignTo || "",
    status: mapStatus(detail.status || detail.task?.status || "pending"),
    priority: mapPriority(detail.task?.priority),
    dueDate: detail.dueDate || new Date().toISOString(),
    createdDate: detail.createdAt,
  };
}

export async function mockGetTasksByStudent(studentId: string, params?: { status?: string; priority?: string; groupId?: string }): Promise<Task[]> {
  const filtered = mockTaskStore.filter(d => d.assignTo === studentId && (!params?.groupId || d.groupId === params.groupId));
  const byStatus = params?.status ? filtered.filter(d => mapStatus(d.status) === mapStatus(params.status)) : filtered;
  const byPriority = params?.priority ? byStatus.filter(d => mapPriority(d.task.priority) === mapPriority(params.priority)) : byStatus;
  return byPriority.map(toTask);
}

export async function mockGetTaskDetail(taskDetailId: string): Promise<Task | null> {
  const found = mockTaskStore.find(d => d.id === taskDetailId);
  return found ? toTask(found) : null;
}

export async function mockCreateTask(payload: CreateTaskPayload): Promise<Task> {
  const id = `d-${Date.now()}`;
  const taskId = `t-${Date.now()}`;
  const now = new Date().toISOString();
  const detail: MockTaskDetail = {
    id,
    taskId,
    groupId: payload.groupId,
    groupName: `Group ${payload.groupId}`,
    assignTo: payload.assigneeUserId,
    assignedToName: "Thành viên", // có thể tra tên từ mock group members
    status: "pending",
    progressPercent: 0,
    dueDate: payload.dueDate || new Date().toISOString(),
    createdAt: now,
    task: {
      id: taskId,
      title: payload.taskName,
      description: payload.description || "",
      priority: payload.priority ?? 2,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    },
  };
  mockTaskStore.unshift(detail);
  return toTask(detail);
}

export async function mockUpdateTaskProgress(taskDetailId: string, payload: UpdateProgressPayload): Promise<Task> {
  const found = mockTaskStore.find(d => d.id === taskDetailId);
  if (!found) throw new Error("TaskDetail not found");
  if (payload.status) found.status = payload.status;
  if (typeof payload.progressPercent === "number") found.progressPercent = payload.progressPercent;
  if (payload.remarks) found.remarks = payload.remarks;
  found.updatedAt = new Date().toISOString();
  if (mapStatus(found.status) === "completed") {
    found.completedAt = new Date().toISOString();
  }
  return toTask(found);
}