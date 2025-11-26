/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateGroupMemberViewModel } from '../models/CreateGroupMemberViewModel';
import type { GroupMemberViewModel } from '../models/GroupMemberViewModel';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class GroupMemberService {
    /**
     * @returns GroupMemberViewModel Success
     * @throws ApiError
     */
    public static getApiGroupMember({
        groupId,
        userId,
        keyword,
        pageNumber,
        pageSize,
    }: {
        groupId?: string,
        userId?: string,
        keyword?: string,
        pageNumber?: number,
        pageSize?: number,
    }): CancelablePromise<Array<GroupMemberViewModel>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/GroupMember',
            query: {
                'GroupId': groupId,
                'UserId': userId,
                'Keyword': keyword,
                'PageNumber': pageNumber,
                'PageSize': pageSize,
            },
        });
    }
    /**
     * @returns GroupMemberViewModel Success
     * @throws ApiError
     */
    public static postApiGroupMember({
        requestBody,
    }: {
        requestBody?: CreateGroupMemberViewModel,
    }): CancelablePromise<GroupMemberViewModel> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/GroupMember',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns GroupMemberViewModel Success
     * @throws ApiError
     */
    public static getApiGroupMember1({
        id,
    }: {
        id: string,
    }): CancelablePromise<GroupMemberViewModel> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/GroupMember/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns any Success
     * @throws ApiError
     */
    public static deleteApiGroupMember({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/GroupMember/{id}',
            path: {
                'id': id,
            },
        });
    }
}
