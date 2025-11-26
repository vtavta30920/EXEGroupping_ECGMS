/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GradeItem } from './GradeItem';
import type { User } from './User';
export type UserFinalGrade = {
    id?: string;
    userId?: string;
    gradeItemId?: string;
    score?: number | null;
    createdBy?: string | null;
    updatedBy?: string | null;
    note?: string | null;
    createdAt?: string | null;
    createdByNavigation?: User;
    gradeItem?: GradeItem;
    updatedByNavigation?: User;
    user?: User;
};

