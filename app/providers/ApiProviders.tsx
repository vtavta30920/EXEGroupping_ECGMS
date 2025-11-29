"use client";

import { OpenAPI } from "@/lib/api/generated";
import { useEffect } from "react";

/**
 * ApiProvider – cấu hình OpenAPI client cho Client Components
 * (Server Action sẽ có config riêng)
 */
export function ApiProvider({ children }: { children: React.ReactNode }) {

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

    // BASE cho client
    OpenAPI.BASE = baseUrl ? `${baseUrl}/proxy` : "/api/proxy";

    // Gửi cookie HttpOnly khi gọi API
    OpenAPI.WITH_CREDENTIALS = true;

    // Optional fallback: nếu có token FE
    const token = typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

    if (token) OpenAPI.TOKEN = token;

  }, []);

  return <>{children}</>;
}
