"use client";

import { Loader2 } from "lucide-react";

export default function LoginLoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-3xl font-bold text-white">FU</span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
            <p className="text-lg font-semibold text-gray-900">Đang đăng nhập...</p>
          </div>
          <p className="text-sm text-gray-600 max-w-sm">
            Vui lòng đợi trong giây lát. Hệ thống đang xác thực thông tin của bạn.
          </p>
        </div>
        <div className="flex justify-center gap-1 pt-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}

