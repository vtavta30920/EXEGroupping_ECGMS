// lib/api/taskService.ts
import {
  GroupMemberService,
  OpenAPI,
} from "@/lib/api/generated";
import type { Task } from "@/lib/types";

// Luôn trỏ về Proxy để tránh CORS
const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
OpenAPI.BASE = apiUrl ? `${apiUrl}/proxy` : '/api/proxy';

export class TaskService {
  static async getTasksByGroupId(groupId: string): Promise<Task[]> {
    try {
      // Use GroupMemberService with GroupId query parameter to verify group exists
      const groupMembers = await GroupMemberService.getApiGroupMember({ groupId });
      
      console.log(`[TaskService] Found ${groupMembers.length} members for group ${groupId}`);
      
      // TODO: Implement proper task fetching when backend endpoint is available
      // For now, return empty array since the /api/Group/{id} endpoint returns 405
      // The correct endpoint should be something like /api/Task?GroupId={groupId}
      
      return [];

    } catch (err) {
      console.error("[TaskService] Failed to fetch tasks:", err);
      return []; 
    }
  }
}
