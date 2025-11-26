// mock-data/summer2025-data.ts
// Dữ liệu giả lập cho kịch bản kỳ học Summer 2025
// Sử dụng để kiểm thử tính năng khởi tạo khóa học và nhóm trống

import type { Course, Group, GroupMember, GroupNeeds } from "@/lib/types";

// =================================================================
// KỊCH BẢN: KỲ HỌC SUMMER 2025
// - Tổng số sinh viên: 500
// - Số lớp (courses): 5
// - Sinh viên mỗi lớp: 100
// - Số nhóm trống cần tạo mỗi lớp: 35 (100 / 4 * 1.4)
// =================================================================

// ===== DANH SÁCH 5 LỚP HỌC (COURSES) CỦA KỲ SUMMER 2025 =====
export const mockSummer2025Courses: Course[] = [
  {
    courseId: "SUM25-C01",
    courseCode: "EXE101-C1",
    courseName: "EXE101 - Lớp 1",
    semester: "Summer",
    year: 2025,
    lecturerId: "L001", // Gán cho Dr. Nguyen Van An
    description: "Lớp học EXE101 cho kỳ Summer 2025, nhóm 1.",
  },
  {
    courseId: "SUM25-C02",
    courseCode: "EXE101-C2",
    courseName: "EXE101 - Lớp 2",
    semester: "Summer",
    year: 2025,
    lecturerId: "L002", // Gán cho M.S. Hoang Thi Binh
    description: "Lớp học EXE101 cho kỳ Summer 2025, nhóm 2.",
  },
  {
    courseId: "SUM25-C03",
    courseCode: "EXE101-C3",
    courseName: "EXE101 - Lớp 3",
    semester: "Summer",
    year: 2025,
    lecturerId: "L003", // Gán cho Dr. Phan Van Cuong
    description: "Lớp học EXE101 cho kỳ Summer 2025, nhóm 3.",
  },
  {
    courseId: "SUM25-C04",
    courseCode: "EXE101-C4",
    courseName: "EXE101 - Lớp 4",
    semester: "Summer",
    year: 2025,
    lecturerId: "L004", // Gán cho Th.S Le Thi Dung
    description: "Lớp học EXE101 cho kỳ Summer 2025, nhóm 4.",
  },
  {
    courseId: "SUM25-C05",
    courseCode: "EXE101-C5",
    courseName: "EXE101 - Lớp 5",
    semester: "Summer",
    year: 2025,
    lecturerId: "L005", // Gán cho Dr. Tran Minh Giang
    description: "Lớp học EXE101 cho kỳ Summer 2025, nhóm 5.",
  },
];


// ===== DỮ LIỆU NHÓM CHO KỲ HỌC SUMMER 2025 =====

// --- Dữ liệu thành viên mẫu để đưa vào các nhóm ---
const sampleMembers: GroupMember[] = [
    { userId: "S001", fullName: "Tran Thi Anh", avatarUrl: "/placeholder-user.jpg" },
    { userId: "S002", fullName: "Le Van Bach", avatarUrl: "/placeholder-user.jpg" },
    { userId: "S003", fullName: "Dang Ngoc Chau", avatarUrl: "/placeholder-user.jpg" },
    { userId: "S004", fullName: "Bui Minh Duc", avatarUrl: "/placeholder-user.jpg" },
    { userId: "S005", fullName: "Vuong Thanh I", avatarUrl: "/placeholder-user.jpg" },
];

// --- Tạo các nhóm mẫu có sẵn thành viên để minh họa các trạng thái ---
const sampleGroupsWithMembers: Group[] = [
  // Nhóm 1: Trạng thái "lock", đủ 3 thành viên, có thể khóa nhóm
  {
    groupId: "SUM25-C01-G01",
    groupName: "Cyber Elites",
    courseId: "SUM25-C01",
    courseCode: "EXE101-C1",
    memberCount: 3,
    maxMembers: 6,
    leaderId: "S001",
    leaderName: "Tran Thi Anh",
    status: "lock",
    majors: ["SE", "SS"],
    createdDate: "2025-10-15",
    members: sampleMembers.slice(0, 3),
    needs: [ { major: "SE", count: 1 }, { major: "SS", count: 2 } ],
    isLockedByRule: true,
  },
  // Nhóm 2: Trạng thái "open", chưa đủ 3 thành viên
  {
    groupId: "SUM25-C01-G02",
    groupName: "Code Wizards",
    courseId: "SUM25-C01",
    courseCode: "EXE101-C1",
    memberCount: 2,
    maxMembers: 6,
    leaderId: "S004",
    leaderName: "Bui Minh Duc",
    status: "open",
    majors: ["SS"],
    createdDate: "2025-10-16",
    members: sampleMembers.slice(3, 5),
    needs: [ { major: "SE", count: 3 }, { major: "SS", count: 1 }],
    isLockedByRule: false,
  },
  // Nhóm 3: Trạng thái "finalize", đã đủ thành viên
  {
    groupId: "SUM25-C01-G03",
    groupName: "Innovate FPT",
    courseId: "SUM25-C01",
    courseCode: "EXE101-C1",
    memberCount: 6,
    maxMembers: 6,
    leaderId: "S006",
    leaderName: "Nguyen Hoang K",
    status: "finalize",
    majors: ["SE", "SS"],
    createdDate: "2025-10-14",
    members: [ ...sampleMembers, { userId: "S006", fullName: "Nguyen Hoang K" }],
    needs: [],
  },
  // Nhóm 4: Trạng thái "private", chỉ có thể vào bằng lời mời
  {
    groupId: "SUM25-C01-G04",
    groupName: "Stealth Coders",
    courseId: "SUM25-C01",
    courseCode: "EXE101-C1",
    memberCount: 2,
    maxMembers: 5,
    leaderId: "S007",
    leaderName: "Le My L",
    status: "private",
    majors: ["SE"],
    createdDate: "2025-10-17",
    members: [{ userId: "S007", fullName: "Le My L" }, { userId: "S008", fullName: "Phan Gia M" }],
    needs: [],
  },
];

// --- Hàm tạo 35 nhóm trống cho một khóa học ---
const createEmptyGroupsForCourse = (course: Course): Group[] => {
  return Array.from({ length: 35 }, (_, i) => {
    // Bỏ qua các ID đã được sử dụng bởi các nhóm mẫu ở trên để tránh trùng lặp
    if (course.courseId === "SUM25-C01" && i < sampleGroupsWithMembers.length) {
        return null;
    }

    return {
        groupId: `${course.courseId}-G${(i + 1).toString().padStart(2, '0')}`,
        groupName: `Nhóm ${i + 1}`,
        courseId: course.courseId,
        courseCode: course.courseCode,
        memberCount: 0,
        maxMembers: 6,
        leaderName: "Chưa có",
        leaderId: "",
        status: "open",
        majors: [],
        createdDate: "2025-10-15",
        members: [],
        needs: [ { major: "SE", count: 3 }, { major: "SS", count: 3 } ],
    }
  }).filter(g => g !== null) as Group[];
}

// --- Tạo và kết hợp tất cả dữ liệu nhóm ---
let allGroups: Group[] = [];
mockSummer2025Courses.forEach(course => {
    if (course.courseId === "SUM25-C01") {
        // Lớp đầu tiên sẽ có các nhóm mẫu + các nhóm trống còn lại
        const emptyGroups = createEmptyGroupsForCourse(course);
        allGroups = [...allGroups, ...sampleGroupsWithMembers, ...emptyGroups];
    } else {
        // Các lớp khác chỉ có nhóm trống
        allGroups = [...allGroups, ...createEmptyGroupsForCourse(course)];
    }
});

export const mockSummer2025Groups: Group[] = allGroups;