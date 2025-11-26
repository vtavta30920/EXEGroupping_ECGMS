/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Group } from './Group';
import type { Task } from './Task';
import type { TaskProcessing } from './TaskProcessing';
import type { User } from './User';
export type TaskDetail = {
    id?: string;
    taskId?: string;
    groupId?: string;
    assignedBy?: string;
    assignTo?: string | null;
    status?: string | null;
    progressPercent?: number | null;
    startDate?: string | null;
    dueDate?: string | null;
    completedAt?: string | null;
    remarks?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    assignToNavigation?: User;
    assignedByNavigation?: User;
    group?: Group;
    task?: Task;
    taskProcessings?: Array<TaskProcessing> | null;
};

