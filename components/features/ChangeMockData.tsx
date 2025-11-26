"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export interface ChangeMockDataProps {
  loading?: boolean;
  onRefresh: () => void | Promise<void>;
  useMock: boolean;
  setUseMock: React.Dispatch<React.SetStateAction<boolean>>;
  persist?: boolean; // lưu lựa chọn vào localStorage
  persistKey?: string; // key lưu, mặc định 'useMock'
  className?: string;
  // Tuỳ chọn: bật cho phép tất cả vai trò đăng nhập (Admin/Lecturer)
  allowAllRoles?: boolean;
  setAllowAllRoles?: React.Dispatch<React.SetStateAction<boolean>>;
  allowAllRolesPersistKey?: string; // mặc định 'allowAllRoles'
}

/**
 * Component nút Làm mới + Chuyển chế độ Mock/API
 * Dùng cho các trang trong app/(dashboard)/(admin|student|lecturer)/...
 */
export default function ChangeMockData({
  loading,
  onRefresh,
  useMock,
  setUseMock,
  persist = true,
  persistKey = "useMock",
  className,
  allowAllRoles,
  setAllowAllRoles,
  allowAllRolesPersistKey = "allowAllRoles",
}: ChangeMockDataProps) {
  // Tránh mismatch giữa SSR và Client: chỉ hiển thị trạng thái động sau khi mount
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = React.useCallback(() => {
    setUseMock(prev => {
      const next = !prev;
      if (persist && typeof window !== "undefined") {
        try {
          localStorage.setItem(persistKey, next ? "true" : "false");
        } catch {}
      }
      return next;
    });
  }, [setUseMock, persist, persistKey]);

  const handleToggleRoles = React.useCallback(() => {
    if (!setAllowAllRoles) return;
    setAllowAllRoles(prev => {
      const next = !prev;
      if (persist && typeof window !== "undefined") {
        try {
          localStorage.setItem(allowAllRolesPersistKey, next ? "true" : "false");
        } catch {}
      }
      return next;
    });
  }, [setAllowAllRoles, persist, allowAllRolesPersistKey]);

  return (
    <div className={className ? className : "flex items-center gap-2"}>
      <Button variant="outline" onClick={onRefresh} disabled={Boolean(loading)}>
        Làm mới
      </Button>
      <Button variant={mounted && useMock ? "secondary" : "outline"} onClick={handleToggle}>
        <span suppressHydrationWarning>
          {mounted ? (useMock ? "Đang dùng mock" : "Đang dùng API") : "Đang dùng API"}
        </span>
      </Button>
      {typeof allowAllRoles !== "undefined" && setAllowAllRoles && (
        <Button variant={mounted && allowAllRoles ? "secondary" : "outline"} onClick={handleToggleRoles}>
          <span suppressHydrationWarning>
            {mounted ? (allowAllRoles ? "Cho phép mọi vai trò" : "Chỉ sinh viên") : "Chỉ sinh viên"}
          </span>
        </Button>
      )}
    </div>
  );
}