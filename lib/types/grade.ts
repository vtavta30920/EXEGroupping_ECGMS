// ===== GRADE TYPES =====
export interface GradeItem {
  gradeItemId: string;
  courseId: string;
  courseCode: string;
  itemName: string;
  maxScore: number;
  weight: number;
  type: "group" | "individual";
  description?: string;
}

export interface Grade {
  gradeId: string;
  gradeItemId: string;
  studentId?: string;
  groupId?: string;
  score: number;
  feedback?: string;
  gradedBy: string;
  gradedDate: string;
}

export interface GradeForm {
  score: number;
  feedback?: string;
}

export interface CheckpointGrade {
  checkpointId: string;
  checkpointNumber: number;
  checkpointName: string;
  groupId: string;
  groupName: string;
  taskGrades: number[];
  averageGrade: number;
  weight: number;
  weightedScore: number;
}

export interface CourseFinalGrade {
  courseId: string;
  courseCode: string;
  courseName: string;
  groupId: string;
  groupName: string;
  checkpointGrades: CheckpointGrade[];
  finalGrade: number;
}

export interface ContributionScoreInput {
  groupId: string;
  studentId: string;
  score: number;
}

export type GradeType = "group" | "individual";

