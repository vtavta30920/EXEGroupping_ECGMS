// ===== COURSE TYPES =====
export interface Course {
  courseId: string;
  courseCode: string;
  courseName: string;
  semester: string;
  year?: number;
  lecturerId?: string;
  description?: string;
  status?: "open" | "pending" | "closed" | string;
  groupCount?: number;
  studentCount?: number;
  lecturerCount?: number;
  maxMembers?: number;
  createdDate?: string;
  updatedDate?: string;
}

