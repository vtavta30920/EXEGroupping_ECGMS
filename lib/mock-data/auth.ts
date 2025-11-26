// lib/mock-data/auth.ts
// Mock user data - Replace with API calls later
import type { User } from "@/lib/types"

export const mockUsers: User[] = [
  // ADMIN (1)
  {
    userId: "A001",
    username: "admin1",
    fullName: "Admin Phòng Đào Tạo",
    email: "admin@fpt.edu.vn",
    role: "admin",
    contactInfo: "0934567890",
  },
  // LECTURERS (5)
  {
    userId: "L001",
    username: "lecturer1",
    fullName: "Dr. Nguyen Van An",
    email: "annv@fpt.edu.vn",
    role: "lecturer",
    contactInfo: "0901234567",
  },
  {
    userId: "L002",
    username: "lecturer2",
    fullName: "M.S. Hoang Thi Binh",
    email: "binhht@fpt.edu.vn",
    role: "lecturer",
    contactInfo: "0987654321",
  },
  {
    userId: "L003",
    username: "lecturer3",
    fullName: "Dr. Phan Van Cuong",
    email: "cuongpv@fpt.edu.vn",
    role: "lecturer",
    contactInfo: "0911223344",
  },
  {
    userId: "L004",
    username: "lecturer4",
    fullName: "Th.S Le Thi Dung",
    email: "dunglt@fpt.edu.vn",
    role: "lecturer",
    contactInfo: "0912345678",
  },
  {
    userId: "L005",
    username: "lecturer5",
    fullName: "Dr. Tran Minh Giang",
    email: "giangtm@fpt.edu.vn",
    role: "lecturer",
    contactInfo: "0988776655",
  },
  // STUDENTS (5)
  {
    userId: "SE171532",
    username: "zap",
    fullName: "Hồ Nguyên Giáp",
    email: "giaphnse171532@fpt.edu.vn",
    role: "student",
    major: "SE",
    skillSet: ["Frontend", "React", "TypeScript"],
    birthday: "2003-01-06",
    contactInfo: "0912345678",
    groupId: null, // <-- CẬP NHẬT: CHƯA CÓ NHÓM
    // CẬP NHẬT: Chưa pass EXE101, bắt đầu với 101
    studentCourses: [
      {
        courseCode: "EXE101",
        status: "in_progress",
      },
    ],
  },
  {
    userId: "S001",
    username: "student1",
    fullName: "Tran Thi B",
    email: "tranthib@fpt.edu.vn",
    role: "student",
    major: "SE",
    skillSet: ["Frontend", "React", "TypeScript"],
    birthday: "2003-05-15",
    contactInfo: "0912345678",
    groupId: null, // <-- CHƯA CÓ NHÓM
  },
  {
    userId: "S002",
    username: "student2",
    fullName: "Le Van C",
    email: "levanc@fpt.edu.vn",
    role: "student",
    major: "SS",
    skillSet: ["Backend", "Node.js", "Database"],
    birthday: "2003-08-20",
    contactInfo: "0923456789",
    groupId: "SUM25-C01-G01", // <-- Cùng nhóm với Giáp
  },
  {
    userId: "S003",
    username: "student3",
    fullName: "Dang Ngoc G",
    email: "dangngocg@fpt.edu.vn",
    role: "student",
    major: "SE",
    skillSet: ["DevOps", "CI/CD", "AWS"],
    birthday: "2003-11-30",
    contactInfo: "0933445566",
  },
  {
    userId: "S004",
    username: "student4",
    fullName: "Bui Minh H",
    email: "buiminhh@fpt.edu.vn",
    role: "student",
    major: "SS",
    skillSet: ["Business Analyst", "Tester", "QA"],
    birthday: "2003-01-25",
    contactInfo: "0944556677",
  },
  {
    userId: "S005",
    username: "student5",
    fullName: "Vuong Thanh I",
    email: "vuongthanhi@fpt.edu.vn",
    role: "student",
    major: "SE",
    skillSet: ["Frontend", "VueJS", "UI/UX"],
    birthday: "2003-09-05",
    contactInfo: "0955667788",
  },
]

// Mock authentication function - Replace with API call later
export function authenticateUser(username: string, password: string): User | null {
  // In real app, this would call an API endpoint
  // For now, accept any user with password "password123"
  if (password === "password123") {
    return mockUsers.find((user) => user.username === username) || null
  }
  return null
}