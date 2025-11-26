/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Course } from './Course';
import type { User } from './User';
export type StudentCourse = {
    userId?: string;
    courseId?: string;
    enrolledAt?: string | null;
    status?: string | null;
    course?: Course;
    user?: User;
};

