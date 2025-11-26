/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Group } from './Group';
import type { User } from './User';
export type GroupMember = {
    userId?: string;
    groupId?: string;
    roleInGroup?: string | null;
    joinedAt?: string | null;
    leftAt?: string | null;
    status?: string | null;
    note?: string | null;
    group?: Group;
    user?: User;
};

