// ===== TASK TYPES =====
export interface Checkpoint {
  checkpointId: string;
  courseId: string;
  courseCode: string;
  checkpointNumber: number;
  checkpointName: string;
  startDate: string;
  endDate: string;
  weight: number;
  description?: string;
}

export interface Task {
  taskId: string;
  taskName: string;
  description: string;
  groupId: string;
  groupName: string;
  courseId: string;
  courseCode: string;
  checkpointId: string;
  checkpointNumber: number;
  assignedTo?: string;
  assignedToId?: string;
  status: "pending" | "in-progress" | "submitted" | "graded";
  priority: "low" | "medium" | "high";
  dueDate: string;
  createdDate: string;
  submittedDate?: string;
  submittedBy?: string;
  grade?: number;
  maxScore?: number;
  feedback?: string;
  gradedBy?: string;
  gradedDate?: string;
}

export interface CreateTaskForm {
  taskName: string;
  description: string;
  courseId: string;
  checkpointId: string;
  groupIds: string[];
  priority: "low" | "medium" | "high";
  dueDate: string;
  maxScore: number;
}

export interface TaskGradeForm {
  taskId: string;
  score: number;
  feedback?: string;
}

export interface TaskAssignmentForm {
  groupId: string;
  taskName: string;
  description?: string;
  assigneeUserId: string;
  dueDate: string;
}

export type TaskStatus = "pending" | "in-progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

