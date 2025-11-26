// lib/mock-data/courses.ts
// Mock course data - Replace with API calls later
import type { Course } from "@/lib/types"

export const mockCourses: Course[] = [
  {
    courseId: "C001",
    courseCode: "EXE102",
    courseName: "Experiential Entrepreneurship 2",
    semester: "Spring",
    year: 2025,
    lecturerId: "L001",
    description: "Project-based course focusing on entrepreneurship and team collaboration",
  },
  {
    courseId: "C002",
    courseCode: "PRJ301",
    courseName: "Java Web Application Development",
    semester: "Spring",
    year: 2025,
    lecturerId: "L001",
    description: "Building web applications using Java technologies",
  },
  {
    courseId: "C003",
    courseCode: "SWP391",
    courseName: "Software Development Project",
    semester: "Spring",
    year: 2025,
    lecturerId: "L001",
    description: "Full-stack software development project",
  },
  {
    courseId: "C004",
    courseCode: "DBI202",
    courseName: "Database Systems",
    semester: "Summer",
    year: 2025,
    lecturerId: "L002",
    description: "Fundamentals of database design and SQL.",
  },
  {
    courseId: "C005",
    courseCode: "CSD201",
    courseName: "Data Structures and Algorithms",
    semester: "Summer",
    year: 2025,
    lecturerId: "L003",
    description: "Core concepts in data structures and algorithm analysis.",
  },
  {
    courseId: "C006",
    courseCode: "MAD101",
    courseName: "Mobile Application Development",
    semester: "Fall",
    year: 2025,
    lecturerId: "L002",
    description: "Introduction to building applications for Android and iOS.",
  },
  {
    courseId: "C007",
    courseCode: "IOT102",
    courseName: "Internet of Things",
    semester: "Fall",
    year: 2025,
    lecturerId: "L003",
    description: "Developing applications for IoT devices.",
  },
  {
    courseId: "C008",
    courseCode: "NWC203c",
    courseName: "Computer Networking",
    semester: "Spring",
    year: 2025,
    lecturerId: "L001",
    description: "Understanding network protocols and layers.",
  },
]

// API placeholder functions - Replace with actual API calls later
export async function getCourses(): Promise<Course[]> {
  // TODO: Replace with actual API call
  // return fetch('/api/courses').then(res => res.json())
  return Promise.resolve(mockCourses)
}

export async function getCourseById(courseId: string): Promise<Course | null> {
  // TODO: Replace with actual API call
  // return fetch(`/api/courses/${courseId}`).then(res => res.json())
  return Promise.resolve(mockCourses.find((c) => c.courseId === courseId) || null)
}
