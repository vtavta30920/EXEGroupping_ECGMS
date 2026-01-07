import { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/utils/auth";
import type { User, MajorItem, UserProfile } from "@/lib/types";
import { MajorService } from "@/lib/api/majorService";
import { UserProfileService } from "@/lib/api/generated/services/UserProfileService";
import { UserService } from "@/lib/api/generated/services/UserService";

export function useStudentProfileData() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedMajor, setSelectedMajor] = useState<string | undefined>(
    undefined
  );
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const initData = async () => {
      // 1. Load User
      const currentUser = getCurrentUser() as User | null;
      setUser(currentUser);
      if (currentUser) {
        setSelectedMajor(currentUser.major);
        // Normalize skillSet
        const skillsArray = Array.isArray(currentUser.skillSet)
          ? currentUser.skillSet
          : typeof currentUser.skillSet === "string"
          ? currentUser.skillSet
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];
        setSelectedSkills(skillsArray);

        // 2a. Load UserProfile from API
        try {
          let uid = currentUser.userId;
          const isUuid =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
              String(uid)
            );

          if (!isUuid) {
            // Try to resolve UUID from email if current ID is not UUID
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
              // Ignore error
            }
          }

          // Verify again if we have UUID now
          const resolvedIsUuid =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
              String(uid)
            );

          if (!resolvedIsUuid) {
            // Fallback logic for non-UUID users (legacy)
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
                if (mappedProfile.major?.majorCode)
                  setSelectedMajor(mappedProfile.major.majorCode);
                return;
              }
            } catch {}
          }

          const apiProfile = await UserProfileService.getApiUserProfile1({
            id: uid,
          });
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

      setIsLoading(false);
    };

    initData();
  }, []);

  return {
    user,
    isLoading,
    profile,
    selectedMajor,
    selectedSkills,
  };
}
