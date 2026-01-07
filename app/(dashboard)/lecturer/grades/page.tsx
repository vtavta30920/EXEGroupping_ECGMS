"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/utils/auth";
import { Clock } from "lucide-react";

export default function GradesPage() {
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== "lecturer") {
      router.push("/login");
    }
  }, [router]);

  return (
    <DashboardLayout role="lecturer">
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-orange-100 p-4 rounded-full">
                <Clock className="w-12 h-12 text-orange-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Tính năng đang phát triển
            </h1>
            <p className="text-gray-600">
              Trang quản lý điểm số sẽ sớm được cập nhật. Vui lòng quay lại sau!
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
