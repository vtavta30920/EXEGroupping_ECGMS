// lib/types/admin-user.ts
export interface Student {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  studentCode?: string;
  userProfile?: {
    fullName?: string;
    studentCode?: string;
    major?: {
      majorCode?: string;
      majorName?: string;
    };
  };
  major?: { majorCode?: string };
  roleName?: string;
  skillSet?: string;
}

export type SortKey =
  | "username"
  | "fullName"
  | "email"
  | "studentCode"
  | "skillSet"
  | null;

export type SortConfig = { key: SortKey; direction: "asc" | "desc" };

export type ViewMode = "student" | "lecturer";
