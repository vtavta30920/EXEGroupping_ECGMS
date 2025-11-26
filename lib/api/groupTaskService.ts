// lib/api/groupTaskService.ts
import { OpenAPI } from "@/lib/api/generated";
import type { Task, TaskStatus, TaskPriority } from "@/lib/types";

// Base proxy: đồng nhất với các service khác
OpenAPI.BASE = "/api/proxy";

type CreateTaskPayload = {
  groupId: string;
  taskName: string;
  description?: string;
  assigneeUserId: string;
  dueDate?: string; // ISO string
  priority?: string | number; // backend có thể dùng string hoặc number
};

type UpdateProgressPayload = {
  status?: string; // pending | in-progress | completed | ...
  progressPercent?: number;
  remarks?: string;
};

function mapStatus(s: any): TaskStatus {
  const v = String(s || "").toLowerCase();
  if (v === "completed" || v === "done") return "completed";
  if (v === "in-progress" || v === "inprogress") return "in-progress";
  return "pending";
}

function mapPriority(p: any): TaskPriority {
  if (p === 1 || String(p).toLowerCase() === "high") return "high";
  if (p === 2 || String(p).toLowerCase() === "medium") return "medium";
  return "low";
}

function toTask(item: any): Task {
  const task = item?.task || item || {};
  const detail = item?.detail || item || {};
  const assignee = item?.assignee || item?.assignToNavigation || {};
  const group = item?.group || {};
  return {
    taskId: detail.id || task.id || item.id || "",
    taskName: task.taskName || task.title || item.taskName || "Task",
    description: task.description || item.description || "",
    groupId: group.id || item.groupId || "",
    groupName: group.name || item.groupName || "",
    assignedTo: assignee.fullName || assignee.username || assignee.email || "",
    assignedToId: assignee.id || item.assignTo || item.assigneeUserId || "",
    status: mapStatus(detail.status || task.status || item.status),
    priority: mapPriority(task.priority || item.priority),
    dueDate: detail.dueDate || task.dueDate || item.dueDate || new Date().toISOString(),
    createdDate: detail.createdAt || task.createdAt || item.createdAt || new Date().toISOString(),
  };
}

export class GroupTaskService {
  static async createTask(payload: CreateTaskPayload): Promise<Task> {
    const res = await fetch(`${OpenAPI.BASE}/GroupTask/Create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`CreateTask failed: ${res.status} ${res.statusText} ${text}`);
    }
    const data = await res.json().catch(() => ({}));
    return toTask(data);
  }

  static async getTasksByStudent(studentId: string, params?: { status?: string; priority?: string; groupId?: string; pageNumber?: number; pageSize?: number }): Promise<Task[]> {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    if (params?.priority) q.set("priority", params.priority);
    if (params?.groupId) q.set("groupId", params.groupId);
    if (params?.pageNumber) q.set("pageNumber", String(params.pageNumber));
    if (params?.pageSize) q.set("pageSize", String(params.pageSize));
    const url = `${OpenAPI.BASE}/GroupTask/Student/${studentId}${q.toString() ? `?${q.toString()}` : ""}`;
    const res = await fetch(url, { cache: "no-store", next: { revalidate: 0 } });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`GetTasksByStudent failed: ${res.status} ${res.statusText} ${text}`);
    }
    const data = await res.json();
    const arr = Array.isArray(data) ? data : (data?.data || []);
    return arr.map(toTask);
  }

  static async getTaskDetail(taskDetailId: string): Promise<Task | null> {
    const res = await fetch(`${OpenAPI.BASE}/GroupTask/Detail/${taskDetailId}`, { cache: "no-store", next: { revalidate: 0 } });
    if (res.status === 404) return null;
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`GetTaskDetail failed: ${res.status} ${res.statusText} ${text}`);
    }
    const data = await res.json();
    return toTask(data);
  }

  static async updateTaskProgress(taskDetailId: string, payload: UpdateProgressPayload): Promise<Task> {
    const res = await fetch(`${OpenAPI.BASE}/GroupTask/UpdateProgress/${taskDetailId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`UpdateTaskProgress failed: ${res.status} ${res.statusText} ${text}`);
    }
    const data = await res.json();
    return toTask(data);
  }
}