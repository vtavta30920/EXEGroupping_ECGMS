/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Group } from './Group';
import type { User } from './User';
export type Topic = {
    id?: string;
    title?: string | null;
    description?: string | null;
    requirement?: string | null;
    maxGroup?: number | null;
    createdBy?: string | null;
    approved?: boolean | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    createdByNavigation?: User;
    groups?: Array<Group> | null;
};

