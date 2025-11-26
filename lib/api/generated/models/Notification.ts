/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from './User';
export type Notification = {
    id?: string;
    userId?: string;
    message?: string | null;
    type?: string | null;
    isRead?: boolean | null;
    createdAt?: string | null;
    user?: User;
};

