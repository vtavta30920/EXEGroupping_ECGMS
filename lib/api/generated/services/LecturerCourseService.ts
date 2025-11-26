/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LecturerCourseCreateViewModel } from '../models/LecturerCourseCreateViewModel';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LecturerCourseService {
    /**
     * @returns any Success
     * @throws ApiError
     */
    public static getApiLecturerCourse(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/LecturerCourse',
        });
    }
    /**
     * @returns any Success
     * @throws ApiError
     */
    public static postApiLecturerCourse({
        requestBody,
    }: {
        requestBody?: LecturerCourseCreateViewModel,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/LecturerCourse',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any Success
     * @throws ApiError
     */
    public static getApiLecturerCourseByCourses({
        coursesId,
    }: {
        coursesId: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/LecturerCourse/by-courses/{coursesId}',
            path: {
                'coursesId': coursesId,
            },
        });
    }
    /**
     * @returns any Success
     * @throws ApiError
     */
    public static getApiLecturerCourse1({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/LecturerCourse/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns any Success
     * @throws ApiError
     */
    public static putApiLecturerCourse({
        id,
        requestBody,
    }: {
        id: string,
        requestBody?: LecturerCourseCreateViewModel,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/LecturerCourse/{id}',
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
    public static deleteApiLecturerCourse({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/LecturerCourse/{id}',
            path: {
                'id': id,
            },
        });
    }
}
