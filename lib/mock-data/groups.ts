// lib/mock-data/groups.ts
// Mock group data - Replace with API calls later
import type { Group, GroupMember } from "@/lib/types";

export const mockGroups: Group[] = [
  {
    groupId: "G001",
    groupName: "Team Alpha",
    courseId: "C001",
    courseCode: "EXE102",
    memberCount: 5,
    maxMembers: 6,
    leaderName: "Tran Thi B",
    leaderId: "S001",
    status: "finalize",
    majors: ["SE", "SS"],
    createdDate: "2025-01-15",
    members: [
      {
        userId: "S001",
        fullName: "Tran Thi B",
        skillSet: ["Frontend", "React", "TypeScript"],
      },
      {
        userId: "S002",
        fullName: "Le Van C",
        skillSet: ["Backend", "Node.js", "Database"],
      },
    ] as any,
    needs: [],
    
  },
  {
    groupId: "G002",
    groupName: "Team Beta",
    courseId: "C001",
    courseCode: "EXE102",
    memberCount: 6,
    maxMembers: 6,
    leaderName: "Le Van C",
    leaderId: "S002",
    status: "finalize",
    majors: ["SE", "SS"],
    createdDate: "2025-01-16",
    members: [
      {
        userId: "S003",
        fullName: "Nguyen Van E",
        skillSet: ["DevOps", "CI/CD", "AWS"],
      },
      {
        userId: "S004",
        fullName: "Pham Thi D",
        skillSet: ["QA", "Testing", "Business Analyst"],
      },
    ] as any,
    needs: [],
  },
  // Các nhóm TRỐNG cho EXE102 được mô phỏng dựa trên API import-groups
  {
    groupId: "G-EXE102-E01",
    groupName: "Empty Group 1",
    courseId: "C001",
    courseCode: "EXE102",
    memberCount: 0,
    maxMembers: 6,
    leaderName: "Chưa có",
    leaderId: "",
    status: "open",
    majors: [],
    createdDate: "2025-02-01",
    members: [],
    needs: [],
  },
  {
    groupId: "G-EXE102-E02",
    groupName: "Empty Group 2",
    courseId: "C001",
    courseCode: "EXE102",
    memberCount: 0,
    maxMembers: 6,
    leaderName: "Chưa có",
    leaderId: "",
    status: "open",
    majors: [],
    createdDate: "2025-02-01",
    members: [],
    needs: [],
  },
  {
    groupId: "G-EXE102-E03",
    groupName: "Empty Group 3",
    courseId: "C001",
    courseCode: "EXE102",
    memberCount: 0,
    maxMembers: 6,
    leaderName: "Chưa có",
    leaderId: "",
    status: "open",
    majors: [],
    createdDate: "2025-02-01",
    members: [],
    needs: [],
    
  },
  {
    groupId: "G003",
    groupName: "Team Gamma",
    courseId: "C002",
    courseCode: "PRJ301",
    memberCount: 4,
    maxMembers: 6,
    leaderName: "Nguyen Van E",
    leaderId: "S003",
    status: "finalize",
    majors: ["SE"],
    createdDate: "2025-01-17",
    members: [
      {
        userId: "S005",
        fullName: "Tran Van F",
        skillSet: ["UI/UX", "Design", "Frontend"],
      },
    ] as any,
    needs: [],
  },
  // Empty groups for PRJ301 to test filters and stats
  {
    groupId: "G-PRJ301-E01",
    groupName: "PRJ Empty Group 1",
    courseId: "C002",
    courseCode: "PRJ301",
    memberCount: 0,
    maxMembers: 6,
    leaderName: "Chưa có",
    leaderId: "",
    status: "open",
    majors: [],
    createdDate: "2025-02-02",
    members: [],
    needs: [],
  },
  {
    groupId: "G-PRJ301-E02",
    groupName: "PRJ Empty Group 2",
    courseId: "C002",
    courseCode: "PRJ301",
    memberCount: 0,
    maxMembers: 6,
    leaderName: "Chưa có",
    leaderId: "",
    status: "open",
    majors: [],
    createdDate: "2025-02-02",
    members: [],
    needs: [],
  },
];

export const mockGroupMembers: GroupMember[] = [
  {
    userId: "S001",
    fullName: "Tran Thi B",
    role: "leader",
    major: "SE",
    avatarUrl: "/placeholder-user.jpg",
    groupId: "G001",
    skillSet: ["Frontend", "React", "TypeScript"],
    courseId: "C001",
    courseCode: "EXE102",
    courseName: "EXE102 Course",
    semester: "Spring",
    year: 2025,
    lecturerId: "L001",
  },
  {
    userId: "S002",
    fullName: "Le Van C",
    role: "member",
    major: "SS",
    avatarUrl: "/placeholder-user.jpg",
    groupId: "G001",
    skillSet: ["Backend", "Node.js", "Database"],
    courseId: "C001",
    courseCode: "EXE102",
    courseName: "EXE102 Course",
    semester: "Spring",
    year: 2025,
    lecturerId: "L001",
  },
];

// API placeholder functions
export async function getGroups(): Promise<Group[]> {
  // TODO: Replace with actual API call
  return Promise.resolve(mockGroups);
}

export async function getGroupById(groupId: string): Promise<Group | null> {
  // TODO: Replace with actual API call
  return Promise.resolve(mockGroups.find((g) => g.groupId === groupId) || null);
}

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  // TODO: Replace with actual API call
  return Promise.resolve(mockGroupMembers.filter((m) => m.groupId === groupId));
}
