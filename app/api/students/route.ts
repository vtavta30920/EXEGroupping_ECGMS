// app/api/students/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api-client';

export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const params = {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      major: searchParams.get('major'),
      search: searchParams.get('search'),
    };
    
    // Get auth token from cookie
    const token = request.cookies.get('auth_token')?.value;
    
    // Forward to backend with auth
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/students?${searchParams}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = request.cookies.get('auth_token')?.value;
    
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/students`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
}