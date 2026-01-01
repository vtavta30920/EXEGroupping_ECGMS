"use client";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useStudentProfileData } from "@/components/features/student/profile/useStudentProfileData";
import { ProfileHeader } from "@/components/features/student/profile/ProfileHeader";
import { ProfileReadView } from "@/components/features/student/profile/ProfileReadView";

export default function StudentProfilePage() {
  const { user, isLoading, profile, selectedMajor, selectedSkills } =
    useStudentProfileData();

  if (isLoading) {
    return (
      <DashboardLayout role="student">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout role="student">
        <p>Không tìm thấy thông tin người dùng.</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-4 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
          <p className="text-sm text-gray-600">Thông tin hồ sơ cá nhân của bạn.</p>
        </div>

        <Card>
          <ProfileHeader
            profileName={profile?.fullName || user.fullName}
            email={user.email}
          />
          <CardContent className="pt-4">
            <ProfileReadView
              user={user}
              profile={profile}
              selectedSkills={selectedSkills}
              selectedMajor={selectedMajor}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
