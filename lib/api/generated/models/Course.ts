/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GradeItem } from './GradeItem';
import type { Group } from './Group';
import type { LecturerCourse } from './LecturerCourse';
import type { StudentCourse } from './StudentCourse';
export type Course = {
    id?: string;
    courseCode?: string | null;
    courseName?: string | null;
    description?: string | null;
    minGroupSize?: number | null;
    maxGroupSize?: number | null;
    requireDiverseMajors?: boolean | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    gradeItems?: Array<GradeItem> | null;
    groups?: Array<Group> | null;
    lecturerCourses?: Array<LecturerCourse> | null;
    studentCourses?: Array<StudentCourse> | null;
};

