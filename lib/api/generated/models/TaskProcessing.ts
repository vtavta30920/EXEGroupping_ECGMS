/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TaskDetail } from './TaskDetail';
import type { User } from './User';
export type TaskProcessing = {
    id?: string;
    taskDetailId?: string;
    progressPercent?: number | null;
    updateComment?: string | null;
    updatedBy?: string | null;
    updatedAt?: string | null;
    taskDetail?: TaskDetail;
    updatedByNavigation?: User;
};

