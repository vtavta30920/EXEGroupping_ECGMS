// ===== COMMON TYPES =====
export type Major = "SS" | "SE";

export interface MajorItem {
  id: string;
  majorCode: string;
  name: string;
  description?: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  totalStudents: number;
  totalGroups: number;
  totalCourses: number;
  activeTasks: number;
  completedTasks: number;
  pendingTasks: number;
}

export interface RecentActivity {
  id: string;
  type: "task_completed" | "group_created" | "grade_assigned" | "member_added";
  description: string;
  timestamp: string;
  userId: string;
  userName: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
  userId: string;
}

export interface SearchFilters {
  searchTerm?: string;
  status?: string;
  role?: "lecturer" | "student" | "admin";
  major?: Major;
  courseId?: string;
  groupId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface SortOptions {
  field: string;
  direction: "asc" | "desc";
}

export interface ExcelExportData {
  students: any[];
  groups: any[];
  courses: any[];
  grades: any[];
  tasks: any[];
}

export interface AppError {
  code: string;
  message: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

