/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TaskDetail } from './TaskDetail';
import type { User } from './User';
export type Task = {
    id?: string;
    title?: string | null;
    description?: string | null;
    createdBy?: string;
    priority?: number | null;
    status?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    createdByNavigation?: User;
    taskDetails?: Array<TaskDetail> | null;
};

