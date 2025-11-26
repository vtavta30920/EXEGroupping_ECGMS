// lib/api/generated/core/OpenAPI.ts

import type { ApiRequestOptions } from './ApiRequestOptions';

type Resolver<T> = (options: ApiRequestOptions) => Promise<T>;
type Headers = Record<string, string>;

export type OpenAPIConfig = {
    BASE: string;
    VERSION: string;
    WITH_CREDENTIALS: boolean;
    CREDENTIALS: 'include' | 'omit' | 'same-origin';
    TOKEN?: string | Resolver<string> | undefined;
    USERNAME?: string | Resolver<string> | undefined;
    PASSWORD?: string | Resolver<string> | undefined;
    HEADERS?: Headers | Resolver<Headers> | undefined;
    ENCODE_PATH?: ((path: string) => string) | undefined;
};

// ✅ FIX CORS: Force BASE luôn là /api/proxy
export const OpenAPI: OpenAPIConfig = {
    // Ưu tiên NEXT_PUBLIC_API_URL nếu có, tự động thêm "/proxy"
    BASE: (process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '')
        ? `${(process.env.NEXT_PUBLIC_API_URL as string).replace(/\/$/, '')}/proxy`
        : '/api/proxy',
    VERSION: '1.0',
    WITH_CREDENTIALS: false,
    CREDENTIALS: 'include',
    TOKEN: undefined,
    USERNAME: undefined,
    PASSWORD: undefined,
    HEADERS: undefined,
    ENCODE_PATH: encodeURIComponent,
};