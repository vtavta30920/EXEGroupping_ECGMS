// app/api/courses/initialize/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.BACKEND_URL || 'http://140.245.42.78:5050';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseCode, courseName, description } = body;

    // Validate input
    if (!courseCode || !courseName) {
      return NextResponse.json(
        { error: "courseCode and courseName are required" },
        { status: 400 }
      );
    }

    // Lấy token từ cookie và forward theo chuẩn Bearer
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value || cookieStore.get('AuthToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Gọi API backend với Authorization Bearer
    const response = await fetch(`${API_BASE_URL}/api/Course/CreateCourseByAdmin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        courseCode,
        courseName,
        description: description || "",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API Initialize] Backend error:", errorText);
      
      return NextResponse.json(
        { error: errorText || "Failed to create course" },
        { status: response.status }
      );
    }

    const createdCourse = await response.json();
    return NextResponse.json(createdCourse, { status: 201 });

  } catch (error) {
    console.error("[API Initialize] Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}