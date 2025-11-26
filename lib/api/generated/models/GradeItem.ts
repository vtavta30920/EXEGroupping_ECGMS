/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Course } from './Course';
import type { UserFinalGrade } from './UserFinalGrade';
export type GradeItem = {
    id?: string;
    courseId?: string;
    itemName?: string | null;
    maxScore?: number | null;
    percentage?: number | null;
    isGroupGrade?: boolean | null;
    course?: Course;
    userFinalGrades?: Array<UserFinalGrade> | null;
};

