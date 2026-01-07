// app/%28dashboard%29/admin/courses/action.tsx
'use server'

import { cookies } from 'next/headers';
import type { Course } from '@/lib/types';

/**
 * Server Action để lấy danh sách khóa học.
 * Chạy hoàn toàn trên Server Next.js -> Gọi trực tiếp sang Backend .NET
 * -> Không bị lỗi CORS.
 */
export async function getCoursesServerSide(): Promise<Course[]> {
  try {
    // 1. Lấy Token từ Cookie (HttpOnly)
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value ?? cookieStore.get('accessToken')?.value;
    
    // 2. Lấy URL Backend từ biến môi trường
    const backendUrl = process.env.BACKEND_URL || 'http://140.245.42.78:5050';

    // Thêm timestamp để bust cache ở mọi tầng
    // const ts = Date.now();
    console.log(`[Server Action] Fetching courses from: ${backendUrl}/api/Course/GetListCourses`);

    // 3. Gọi API Backend (Server-to-Server fetch)
    const res = await fetch(`${backendUrl}/api/Course/GetListCourses?PageNumber=1&PageSize=1000`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, // Đính kèm token nếu cần
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
      // cache: 'no-store', // Luôn lấy dữ liệu mới nhất
      next: { revalidate: 0 }
    });

    if (!res.ok) {
      console.error(`[Server Action Error] Failed to fetch courses: ${res.status} ${res.statusText}`);
      // Trả về mảng rỗng hoặc throw error tuỳ logic
      return [];
    }

    const data = await res.json();

    // 4. Xử lý các định dạng trả về khác nhau của API (Pagination vs Array)
    const items = Array.isArray(data) ? data : (data && Array.isArray(data.items) ? data.items : []);

    // 5. Chuẩn hóa dữ liệu sang FE shape Course và loại bỏ các bản ghi placeholder 'string'
    const normalizeToCourse = (item: any): Course => ({
      courseId: item.id ?? item.courseId ?? "",
      courseCode: item.courseCode ?? "",
      courseName: item.courseName ?? "",
      description: item.description ?? "",
      semester: "N/A",
      year: new Date().getFullYear(),
      // Lấy đúng trạng thái từ BE (Active/Inactive); fallback Active nếu không có
      status: item.status ?? "Active",
      createdDate: item.createdAt ?? item.createdDate ?? new Date().toISOString(),
      updatedDate: item.updatedAt ?? item.updatedDate ?? item.createdAt ?? item.createdDate ?? undefined,
      lecturerId: "",
      groupCount: Array.isArray(item.groups) ? item.groups.length : undefined,
      studentCount: Array.isArray(item.studentCourses) ? item.studentCourses.length : undefined,
    });

    const cleaned: Course[] = items
      .map(normalizeToCourse)
      .filter((c: Course) => !(String(c.courseCode).toLowerCase() === 'string' && String(c.courseName).toLowerCase() === 'string'));

    return cleaned;

  } catch (error) {
    console.error("[Server Action Error] Exception:", error);
    return [];
  }
}