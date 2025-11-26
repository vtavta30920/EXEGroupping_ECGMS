// Mock task data - Replace with API calls later
import type { Task } from "@/lib/types"

export const mockTasks: Task[] = [
  {
    taskId: "T001",
    taskName: "Design Database Schema",
    description: "Create the initial database schema for the project",
    groupId: "G001",
    groupName: "Team Alpha",
    assignedTo: "Le Van C",
    assignedToId: "S002",
    status: "completed",
    priority: "high",
    dueDate: "2025-02-01",
    createdDate: "2025-01-20",
  },
  {
    taskId: "T002",
    taskName: "Implement Login UI",
    description: "Create the login page with form validation",
    groupId: "G001",
    groupName: "Team Alpha",
    assignedTo: "Tran Thi B",
    assignedToId: "S001",
    status: "in-progress",
    priority: "high",
    dueDate: "2025-02-05",
    createdDate: "2025-01-22",
  },
  {
    taskId: "T003",
    taskName: "Write API Documentation",
    description: "Document all API endpoints and their usage",
    groupId: "G002",
    groupName: "Team Beta",
    assignedTo: "Nguyen Van E",
    assignedToId: "S003",
    status: "pending",
    priority: "medium",
    dueDate: "2025-02-10",
    createdDate: "2025-01-25",
  },
  {
    taskId: "T004",
    taskName: "Setup CI/CD Pipeline",
    description: "Configure automated testing and deployment",
    groupId: "G001",
    groupName: "Team Alpha",
    assignedTo: "Le Van C",
    assignedToId: "S002",
    status: "in-progress",
    priority: "medium",
    dueDate: "2025-02-15",
    createdDate: "2025-01-28",
  },
]

// API placeholder functions
export async function getTasks(): Promise<Task[]> {
  // TODO: Replace with actual API call
  return Promise.resolve(mockTasks)
}

export async function getTasksByGroup(groupId: string): Promise<Task[]> {
  // TODO: Replace with actual API call
  return Promise.resolve(mockTasks.filter((t) => t.groupId === groupId))
}
