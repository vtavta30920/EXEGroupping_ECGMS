/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Major } from './Major';
import type { User } from './User';
export type UserProfile = {
    userId?: string;
    majorId?: string | null;
    fullName?: string | null;
    gpa?: number | null;
    bio?: string | null;
    avatarUrl?: string | null;
    status?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    major?: Major;
    user?: User;
};

