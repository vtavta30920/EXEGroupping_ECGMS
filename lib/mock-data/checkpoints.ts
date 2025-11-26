// Mock checkpoint data - Replace with API calls later
import type { Checkpoint } from "@/lib/types"

export const mockCheckpoints: Checkpoint[] = [
  {
    checkpointId: "CP001",
    courseId: "C001",
    courseCode: "EXE102",
    checkpointNumber: 1,
    checkpointName: "Checkpoint 1: Khởi động dự án",
    startDate: "2025-01-15",
    endDate: "2025-02-15",
    weight: 25,
    description: "Giai đoạn đầu tiên của dự án - Phân tích và thiết kế",
  },
  {
    checkpointId: "CP002",
    courseId: "C001",
    courseCode: "EXE102",
    checkpointNumber: 2,
    checkpointName: "Checkpoint 2: Phát triển cốt lõi",
    startDate: "2025-02-16",
    endDate: "2025-03-15",
    weight: 25,
    description: "Giai đoạn phát triển các tính năng cốt lõi",
  },
  {
    checkpointId: "CP003",
    courseId: "C001",
    courseCode: "EXE102",
    checkpointNumber: 3,
    checkpointName: "Checkpoint 3: Hoàn thiện và tối ưu",
    startDate: "2025-03-16",
    endDate: "2025-04-15",
    weight: 25,
    description: "Giai đoạn hoàn thiện và tối ưu hóa sản phẩm",
  },
  {
    checkpointId: "CP004",
    courseId: "C001",
    courseCode: "EXE102",
    checkpointNumber: 4,
    checkpointName: "Checkpoint 4: Báo cáo và đánh giá",
    startDate: "2025-04-16",
    endDate: "2025-05-15",
    weight: 25,
    description: "Giai đoạn cuối - Báo cáo và đánh giá tổng thể",
  },
  {
    checkpointId: "CP005",
    courseId: "C002",
    courseCode: "PRJ301",
    checkpointNumber: 1,
    checkpointName: "Checkpoint 1: Thiết kế hệ thống",
    startDate: "2025-01-20",
    endDate: "2025-02-20",
    weight: 25,
    description: "Thiết kế kiến trúc và database",
  },
  {
    checkpointId: "CP006",
    courseId: "C002",
    courseCode: "PRJ301",
    checkpointNumber: 2,
    checkpointName: "Checkpoint 2: Backend Development",
    startDate: "2025-02-21",
    endDate: "2025-03-21",
    weight: 25,
    description: "Phát triển backend API",
  },
  {
    checkpointId: "CP007",
    courseId: "C002",
    courseCode: "PRJ301",
    checkpointNumber: 3,
    checkpointName: "Checkpoint 3: Frontend Development",
    startDate: "2025-03-22",
    endDate: "2025-04-22",
    weight: 25,
    description: "Phát triển giao diện người dùng",
  },
  {
    checkpointId: "CP008",
    courseId: "C002",
    courseCode: "PRJ301",
    checkpointNumber: 4,
    checkpointName: "Checkpoint 4: Testing và Deployment",
    startDate: "2025-04-23",
    endDate: "2025-05-23",
    weight: 25,
    description: "Kiểm thử và triển khai hệ thống",
  },
]

// API placeholder functions
export async function getCheckpoints(): Promise<Checkpoint[]> {
  return Promise.resolve(mockCheckpoints)
}

export async function getCheckpointsByCourse(courseId: string): Promise<Checkpoint[]> {
  return Promise.resolve(mockCheckpoints.filter((cp) => cp.courseId === courseId))
}

export async function getCheckpointById(checkpointId: string): Promise<Checkpoint | null> {
  return Promise.resolve(mockCheckpoints.find((cp) => cp.checkpointId === checkpointId) || null)
}

