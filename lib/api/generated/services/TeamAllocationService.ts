/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TeamAllocationService {
    /**
     * @returns any Success
     * @throws ApiError
     */
    public static postApiTeamAllocationAllocateTeams({
        courseName,
    }: {
        courseName?: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/TeamAllocation/allocate-teams',
            query: {
                'courseName': courseName,
            },
        });
    }
    /**
     * @returns any Success
     * @throws ApiError
     */
    public static getApiTeamAllocationDownloadTemplate(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/TeamAllocation/download-template',
        });
    }
    /**
     * @returns any Success
     * @throws ApiError
     */
    public static postApiTeamAllocationImportExcel({
        formData,
    }: {
        formData?: {
            file?: Blob;
        },
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/TeamAllocation/import-excel',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * @returns any Success
     * @throws ApiError
     */
    public static getApiTeamAllocationExportExcel(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/TeamAllocation/export-excel',
        });
    }
}
