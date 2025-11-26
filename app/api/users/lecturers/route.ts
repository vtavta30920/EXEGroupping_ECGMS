import { NextResponse } from 'next/server';
import { apiClient } from '@/lib/api-client';

export async function GET() {
  try {
    // Gọi method từ apiClient (đã config gọi sang .NET)
    const allUsers = await apiClient.getLecturers();
    
    // Lọc lấy lecturer (nếu backend trả về all users)
    const lecturers = allUsers.filter((u: any) => u.role === 'lecturer');
    
    return NextResponse.json(lecturers);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch lecturers' },
      { status: error.status || 500 }
    );
  }
}