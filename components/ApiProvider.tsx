// components/ApiProvider.tsx
"use client"

import { OpenAPI } from "@/lib/api/generated";
import { useEffect } from "react";

/**
 * Component này không render giao diện.
 * Nó chỉ dùng để cấu hình API client một lần duy nhất khi ứng dụng tải.
 */
export function ApiProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Thiết lập BASE trỏ về Proxy của Next.js, hỗ trợ dùng biến môi trường
    // Nếu NEXT_PUBLIC_API_URL = http://localhost:3000/api
    // thì BASE sẽ là http://localhost:3000/api/proxy
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
    OpenAPI.BASE = apiUrl ? `${apiUrl}/proxy` : '/api/proxy';

    // Token sẽ được Proxy tự động lấy từ Cookie (HttpOnly) và gắn vào header.
    // Tuy nhiên, nếu bạn cần dùng token ở client cho mục đích khác, có thể lấy từ localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
       OpenAPI.TOKEN = token;
    }

  }, []);

  return <>{children}</>;
}