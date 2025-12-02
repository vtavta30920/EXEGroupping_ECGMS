// ===== USER & AUTHENTICATION TYPES =====
export interface User {
  userId: string;
  username: string;
  fullName: string;
  email: string;
  role: "lecturer" | "student" | "admin";
  major?: "SS" | "SE";
  skillSet?: string | null;
  birthday?: string;
  contactInfo?: string;
  groupId?: string | null;
  roleId?: string;
  studentCourses?: any[];
  userProfile?: UserProfile;
  groups?: any[];
  notifications?: any[];
}

export interface UserProfile {
  userId?: string;
  majorId?: string;
  fullName?: string;
  gpa?: number;
  bio?: string;
  avatarUrl?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  studentCode?: string;
  major?: {
    id: string;
    majorCode?: string;
    majorName?: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

export type UserRole = "lecturer" | "student" | "admin";

export interface LoginForm {
  username: string;
  password: string;
}

