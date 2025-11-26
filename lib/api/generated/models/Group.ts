/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Course } from './Course';
import type { GroupMember } from './GroupMember';
import type { TaskDetail } from './TaskDetail';
import type { Topic } from './Topic';
import type { User } from './User';
export type Group = {
    id?: string;
    name?: string | null;
    courseId?: string;
    topicId?: string | null;
    leaderId?: string | null;
    maxMembers?: number | null;
    countMembers?: number | null;
    startDate?: string | null;
    endDate?: string | null;
    status?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    course?: Course;
    groupMembers?: Array<GroupMember> | null;
    leader?: User;
    taskDetails?: Array<TaskDetail> | null;
    topic?: Topic;
};

