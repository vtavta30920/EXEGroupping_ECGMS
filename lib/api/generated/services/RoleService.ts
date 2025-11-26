/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateRoleViewModel } from '../models/CreateRoleViewModel';
import type { RoleViewModel } from '../models/RoleViewModel';
import type { UpdateRoleViewModel } from '../models/UpdateRoleViewModel';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RoleService {
    /**
     * @returns RoleViewModel Success
     * @throws ApiError
     */
    public static getApiRole({
        keyword,
        pageNumber,
        pageSize,
    }: {
        keyword?: string,
        pageNumber?: number,
        pageSize?: number,
    }): CancelablePromise<Array<RoleViewModel>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Role',
            query: {
                'Keyword': keyword,
                'PageNumber': pageNumber,
                'PageSize': pageSize,
            },
        });
    }
    /**
     * @returns RoleViewModel Success
     * @throws ApiError
     */
    public static postApiRole({
        requestBody,
    }: {
        requestBody?: CreateRoleViewModel,
    }): CancelablePromise<RoleViewModel> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/Role',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns RoleViewModel Success
     * @throws ApiError
     */
    public static getApiRole1({
        id,
    }: {
        id: string,
    }): CancelablePromise<RoleViewModel> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Role/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns RoleViewModel Success
     * @throws ApiError
     */
    public static putApiRole({
        id,
        requestBody,
    }: {
        id: string,
        requestBody?: UpdateRoleViewModel,
    }): CancelablePromise<RoleViewModel> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/Role/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any Success
     * @throws ApiError
     */
    public static deleteApiRole({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/Role/{id}',
            path: {
                'id': id,
            },
        });
    }
}
