/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LecturerCourse } from './LecturerCourse';
import type { User } from './User';
export type Role = {
    id?: string;
    roleName?: string | null;
    description?: string | null;
    createdAt?: string | null;
    lecturerCourses?: Array<LecturerCourse> | null;
    users?: Array<User> | null;
};

