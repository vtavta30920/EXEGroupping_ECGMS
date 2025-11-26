/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GroupMemberRoleViewModel } from './GroupMemberRoleViewModel';
export type GroupMemberViewModel = {
    id?: string;
    userId?: string | null;
    username?: string | null;
    email?: string | null;
    groupId?: string | null;
    groupName?: string | null;
    joinAt?: string | null;
    roles?: Array<GroupMemberRoleViewModel> | null;
};

