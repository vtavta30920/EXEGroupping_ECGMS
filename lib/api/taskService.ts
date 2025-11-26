// lib/api/taskService.ts
import {
  GroupService as GeneratedGroupService,
  OpenAPI,
  type Task as ApiTask,
  type User as ApiUser,
} from "@/lib/api/generated";
import type { Task, TaskStatus } from "@/lib/types";

// Luôn trỏ về Proxy để tránh CORS
const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
OpenAPI.BASE = apiUrl ? `${apiUrl}/proxy` : '/api/proxy';

// Helper map status, priority... (giữ nguyên các helper cũ nếu có hoặc viết lại gọn)
function mapApiStatusToFeStatus(apiStatus: string | null | undefined): "pending" | "in-progress" | "submitted" | "graded" {
    const status = apiStatus?.toLowerCase() || '';
    if (status === 'done' || status === 'completed' || status === 'graded') return 'graded';
    if (status === 'inprogress' || status === 'in-progress') return 'in-progress';
    if (status === 'submitted') return 'submitted';
    return 'pending';
}

function mapApiPriorityToFePriority(apiPriority: number | null | undefined): "low" | "medium" | "high" {
    if (apiPriority === 1) return "high";
    if (apiPriority === 2) return "medium";
    return "low";
}

export class TaskService {
  static async getTasksByGroupId(groupId: string): Promise<Task[]> {
    try {
      // SỬA LỖI: Truyền object { id: groupId }
      const group = await GeneratedGroupService.getApiGroup1({ id: groupId });
      
      const apiTaskDetails = (group as any).taskDetails || [];

      return apiTaskDetails.map((td: any) => {
        const apiTask: ApiTask = td.task || {};
        const assignee: ApiUser = td.assignToNavigation;
        
        return {
          taskId: td.id || apiTask.id || "",
          taskName: apiTask.title || "Chưa đặt tên", 
          description: apiTask.description || "",
          groupId: groupId,
          groupName: group.name || "",
          assignedTo: assignee ? (assignee.username || "Thành viên") : "Chưa gán", 
          assignedToId: td.assignTo || "",
          status: mapApiStatusToFeStatus(td.status || apiTask.status),
          priority: mapApiPriorityToFePriority(apiTask.priority),
          dueDate: td.dueDate || apiTask.updatedAt || new Date().toISOString(),
          createdDate: td.createdAt || apiTask.createdAt || new Date().toISOString(),
        }
      });

    } catch (err) {
      console.error("[TaskService] Failed to fetch tasks:", err);
      return []; 
    }
  }
}
