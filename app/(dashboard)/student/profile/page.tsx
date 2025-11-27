"use client";

import * as React from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserCircle } from "lucide-react";
import { getCurrentUser, updateCurrentUser } from "@/lib/utils/auth";
import type { User, MajorItem, UserProfile } from "@/lib/types"; // Import MajorItem và UserProfile
import type { ChangeMockDataProps } from "@/components/features/ChangeMockData";
import { MajorService } from "@/lib/api/majorService"; // Import Service Adapter mới tạo
import { UserProfileService } from "@/lib/api/generated/services/UserProfileService";
import { UserService } from "@/lib/api/generated/services/UserService";

// Giả sử có danh sách các skill có thể chọn
const availableSkills = [
  "Frontend",
  "Backend",
  "React",
  "Node.js",
  "Database",
  "DevOps",
  "CI/CD",
  "AWS",
  "UI/UX",
  "Business Analyst",
  "Tester",
  "QA",
  "VueJS",
  "Angular",
];

export default function StudentProfilePage() {
  const [user, setUser] = React.useState<User | null>(null);
  const [selectedMajor, setSelectedMajor] = React.useState<string | undefined>(
    undefined
  );
  const [selectedSkills, setSelectedSkills] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);

  // State cho danh sách chuyên ngành
  const [majors, setMajors] = React.useState<MajorItem[]>([]);
  // State cho UserProfile từ API
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [editable, setEditable] = React.useState<{
    fullName?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
  }>({});
  const [effectiveUserId, setEffectiveUserId] = React.useState<string | null>(
    null
  );

  React.useEffect(() => {
    const initData = async () => {
      // 1. Load User
      const currentUser = getCurrentUser() as User | null;
      setUser(currentUser);
      if (currentUser) {
        setSelectedMajor(currentUser.major);
        // Chuẩn hóa skillSet về dạng string[] để tránh lỗi TypeScript
        const skillsArray = Array.isArray(currentUser.skillSet)
          ? currentUser.skillSet
          : typeof currentUser.skillSet === "string"
          ? currentUser.skillSet
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];
        setSelectedSkills(skillsArray);

        // 2a. Load UserProfile từ API theo schema BE
        try {
          let uid = currentUser.userId;
          const isUuid =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
              String(uid)
            );
          if (!isUuid) {
            try {
              const res = await fetch(
                `/api/proxy/api/User/email/${encodeURIComponent(
                  currentUser.email
                )}`,
                { cache: "no-store", headers: { accept: "text/plain" } }
              );
              if (res.ok) {
                const raw = await res.json();
                uid = raw?.id || uid;
              } else {
                const byEmail = await UserService.getApiUserEmail({
                  email: currentUser.email,
                });
                uid = (byEmail as any)?.id || uid;
              }
            } catch {
              try {
                const byEmail = await UserService.getApiUserEmail({
                  email: currentUser.email,
                });
                uid = (byEmail as any)?.id || uid;
              } catch {}
            }
          }
          const resolvedIsUuid =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
              String(uid)
            );
          if (!resolvedIsUuid) {
            try {
              const res = await fetch(
                `/api/proxy/api/User/email/${encodeURIComponent(
                  currentUser.email
                )}`,
                { cache: "no-store", headers: { accept: "text/plain" } }
              );
              if (res.ok) {
                const raw = await res.json();
                const pAny = (raw?.userProfile ||
                  raw?.userProfileViewModel ||
                  {}) as any;
                const mappedProfile: UserProfile = {
                  userId: pAny.userId || raw?.id || currentUser.userId,
                  fullName:
                    pAny.fullName ||
                    raw?.username ||
                    raw?.email ||
                    currentUser.email,
                  bio: pAny.bio,
                  avatarUrl: pAny.avatarUrl,
                  status: pAny.status ?? undefined,
                  major: pAny.major
                    ? {
                        id: pAny.major.majorId || pAny.major.id,
                        majorCode: pAny.major.majorCode,
                        majorName: pAny.major.name,
                        description: pAny.major.description,
                      }
                    : undefined,
                };
                setProfile(mappedProfile);
          setEditable({
            // fullName: mappedProfile.fullName ?? null, // Không cho edit
            bio: mappedProfile.bio ?? null,
            // avatarUrl: mappedProfile.avatarUrl ?? null, // Không cho edit
          });
                if (mappedProfile.major?.majorCode)
                  setSelectedMajor(mappedProfile.major.majorCode);
                return;
              }
            } catch {}
          }
          setEffectiveUserId(uid);
          const apiProfile = await UserProfileService.getApiUserProfile1({
            id: uid,
          });
          // Map về UserProfile (FE)
          const pAny = apiProfile as any;
          const mappedProfile: UserProfile = {
            userId: pAny.userId,
            fullName: pAny.fullName,
            bio: pAny.bio,
            avatarUrl: pAny.avatarUrl,
            status: pAny.status ?? undefined,
            major: pAny.major
              ? {
                  id: pAny.major.majorId || pAny.major.id,
                  majorCode: pAny.major.majorCode,
                  majorName: pAny.major.name,
                  description: pAny.major.description,
                }
              : undefined,
          };
          setProfile(mappedProfile);
          setEditable({
            // fullName: mappedProfile.fullName ?? null, // Không cho edit
            bio: mappedProfile.bio ?? null,
            // avatarUrl: mappedProfile.avatarUrl ?? null, // Không cho edit
          });
          // Nếu có major từ profile, ưu tiên dùng majorCode làm selectedMajor
          if (mappedProfile.major?.majorCode) {
            setSelectedMajor(mappedProfile.major.majorCode);
          }
        } catch (e) {
          console.error(
            "[Profile] Failed to fetch user profile by id:",
            currentUser.userId,
            e
          );
        }
      }

      // 2. Load Majors từ API
      try {
        const majorsData = await MajorService.getMajors();
        setMajors(majorsData);
      } catch (err) {
        console.error("Failed to load majors", err);
      }

      setIsLoading(false);
    };

    initData();
  }, []);

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      // Chỉ gửi các field được phép edit
      const requestBody = {
        // fullName: editable.fullName ?? null, // Không cho edit
        bio: editable.bio ?? null,
        // avatarUrl: editable.avatarUrl ?? null, // Không cho edit
      };
      const uid = effectiveUserId || user.userId;
      await UserProfileService.putApiUserProfile({ id: uid, requestBody });

      const currentMajorCode = profile?.major?.majorCode;
      if (selectedMajor && selectedMajor !== currentMajorCode) {
        await UserProfileService.patchApiUserProfileMajor({
          userId: uid,
          requestBody: { majorCode: selectedMajor },
        });
      }

      const updatedProfile: UserProfile = {
        ...profile,
        // fullName: editable.fullName ?? profile?.fullName ?? null, // Không cho edit
        bio: editable.bio ?? profile?.bio ?? null,
        // avatarUrl: editable.avatarUrl ?? profile?.avatarUrl ?? null, // Không cho edit
        major: selectedMajor
          ? ({ ...(profile?.major || {}), majorCode: selectedMajor } as any)
          : profile?.major,
      } as UserProfile;
      setProfile(updatedProfile);

      const updatedUserData: User = {
        ...user,
        major: selectedMajor as "SE" | "SS" | undefined,
        skillSet: selectedSkills,
        // fullName: (editable.fullName ?? user.fullName) as string, // Không cho edit
      };
      updateCurrentUser(updatedUserData);
      setUser(updatedUserData);

      setIsEditing(false);
      alert("Hồ sơ đã được cập nhật!");
    } catch (err) {
      console.error("[Save Profile] Failed:", err);
      alert("Cập nhật hồ sơ thất bại. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

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
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
          <p className="text-gray-600 mt-1">
            Cập nhật thông tin của bạn để giúp việc ghép nhóm hiệu quả hơn.
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <UserCircle className="w-12 h-12 text-gray-400" />
            <div>
              <CardTitle>
                {isEditing ? (
                  <Input
                    value={editable.fullName ?? ""}
                    onChange={(e) =>
                      setEditable((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                    placeholder="Họ tên"
                  />
                ) : (
                  profile?.fullName || user.fullName
                )}
              </CardTitle>
              <CardDescription>{user.email} </CardDescription>
            </div>
            <div className="ml-auto flex gap-2">
              {!isEditing ? (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setIsEditing(false);
                      setEditable({
                        // fullName: profile?.fullName ?? null, // Không cần reset vì không cho edit
                        bio: profile?.bio ?? null,
                        // avatarUrl: profile?.avatarUrl ?? null, // Không cần reset vì không cho edit
                      });
                      setSelectedMajor(profile?.major?.majorCode);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Save
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Thông tin cố định */}
              <div className="space-y-1">
                <Label>Họ tên:</Label>
                <p className="text-sm text-muted-foreground">
                  {profile?.fullName || user.fullName}
                </p>
              </div>
              <div className="space-y-1">
                <Label>Email:</Label>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="space-y-1">
                <Label>Ngày sinh:</Label>
                <p className="text-sm text-muted-foreground">
                  {user.birthday || "Chưa cập nhật"}
                </p>
              </div>
              <div className="space-y-1">
                <Label>Liên hệ:</Label>
                <p className="text-sm text-muted-foreground">
                  {user.contactInfo || "Chưa cập nhật"}
                </p>
              </div>

              {/* Thông tin có thể chỉnh sửa */}
              <div className="space-y-1">
                <Label>Chuyên ngành (Major)</Label>
                <p className="text-sm text-muted-foreground">
                  {profile?.major?.majorName || selectedMajor || "Chưa cập nhật"}
                </p>
              </div>
            </div>

            {/* Giới thiệu và Avatar */}
            <div className="space-y-1 md:col-span-2">
              <Label>Giới thiệu (Bio)</Label>
              {isEditing ? (
                <Textarea
                  value={editable.bio ?? ""}
                  onChange={(e) =>
                    setEditable((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  placeholder="Giới thiệu ngắn về bạn"
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {profile?.bio || "Chưa cập nhật"}
                </p>
              )}
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Ảnh đại diện (Avatar URL)</Label>
              <p className="text-sm text-muted-foreground">
                {profile?.avatarUrl || "Chưa cập nhật"}
              </p>
            </div>

            <div className="space-y-1">
              <Label>Bộ kỹ năng (SkillSet)</Label>
              <div className="flex flex-wrap gap-2 border rounded-md p-3 mt-1 bg-gray-50">
                {availableSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant={
                      selectedSkills.includes(skill) ? "default" : "outline"
                    }
                    onClick={() => handleSkillToggle(skill)}
                    className="cursor-pointer transition-all hover:scale-105"
                  >
                    {selectedSkills.includes(skill) ? "✓ " : "+ "}
                    {skill}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Chọn các kỹ năng bạn có để các nhóm khác có thể tìm thấy bạn.
              </p>
            </div>

            {isEditing && (
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Lưu thay đổi
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
