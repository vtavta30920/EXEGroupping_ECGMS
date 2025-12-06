/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from '../models/User';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
import { UserStatsViewModel } from '../models/UserStatsViewModel';
export class UserService {
    /**
     * @returns User Success
     * @throws ApiError
     */
    public static getApiUser(): CancelablePromise<Array<User>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/User',
        });
    }
    /**
     * @returns any Success
     * @throws ApiError
     */
    public static postApiUser({
        requestBody,
    }: {
        requestBody?: User,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/User',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns User Success
     * @throws ApiError
     */
    public static getApiUser1({
        id,
    }: {
        id: string,
    }): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/User/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns any Success
     * @throws ApiError
     */
    public static putApiUser({
        id,
        requestBody,
    }: {
        id: string,
        requestBody?: User,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/User/{id}',
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
    public static deleteApiUser({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/User/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns User Success
     * @throws ApiError
     */
    public static getApiUserEmail({
        email,
    }: {
        email: string,
    }): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/User/email/{email}',
            path: {
                'email': email,
            },
        });
    }

        /**
     * 🔥 NEW: Get user statistics (students, lecturers,...)
     * Endpoint: GET /api/User/stats
     * @returns UserStatsViewModel Success
     * @throws ApiError
     */
    public static getApiUserStats(): CancelablePromise<UserStatsViewModel> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/User/stats',
        });
    }
}
