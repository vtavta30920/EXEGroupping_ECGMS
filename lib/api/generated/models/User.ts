/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Group } from './Group';
import type { GroupMember } from './GroupMember';
import type { LecturerCourse } from './LecturerCourse';
import type { Notification } from './Notification';
import type { Role } from './Role';
import type { StudentCourse } from './StudentCourse';
import type { Task } from './Task';
import type { TaskDetail } from './TaskDetail';
import type { TaskProcessing } from './TaskProcessing';
import type { Topic } from './Topic';
import type { UserFinalGrade } from './UserFinalGrade';
import type { UserProfile } from './UserProfile';
export type User = {
    id?: string;
    username?: string | null;
    passwordHash?: string | null;
    email?: string | null;
    roleId?: string;
    skillSet?: string | null;
    groupMembers?: Array<GroupMember> | null;
    groups?: Array<Group> | null;
    lecturerCourses?: Array<LecturerCourse> | null;
    notifications?: Array<Notification> | null;
    role?: Role;
    studentCourses?: Array<StudentCourse> | null;
    taskDetailAssignToNavigations?: Array<TaskDetail> | null;
    taskDetailAssignedByNavigations?: Array<TaskDetail> | null;
    taskProcessings?: Array<TaskProcessing> | null;
    tasks?: Array<Task> | null;
    topics?: Array<Topic> | null;
    userFinalGradeCreatedByNavigations?: Array<UserFinalGrade> | null;
    userFinalGradeUpdatedByNavigations?: Array<UserFinalGrade> | null;
    userFinalGradeUsers?: Array<UserFinalGrade> | null;
    userProfile?: UserProfile;
};

