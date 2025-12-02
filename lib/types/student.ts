// ===== STUDENT WITHOUT GROUP TYPES =====
export interface MajorInfo {
  majorId: string;
  majorCode: string;
  name: string;
  description: string;
}

export interface UserProfileViewModel {
  userId: string;
  fullName: string;
  bio: string;
  avatarUrl: string;
  major: MajorInfo;
  status: string | null;
}

export interface StudentWithoutGroup {
  studentId: string;
  user: {
    id: string;
    username: string;
    email: string;
    skillSet: string;
  };
  userProfileViewModel: UserProfileViewModel;
  majorCode: string;
  coreSkill: string;
}

