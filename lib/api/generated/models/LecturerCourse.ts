/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Course } from './Course';
import type { Role } from './Role';
import type { User } from './User';
export type LecturerCourse = {
    userId?: string;
    courseId?: string;
    roleId?: string;
    startDate?: string | null;
    endDate?: string | null;
    course?: Course;
    role?: Role;
    user?: User;
};

