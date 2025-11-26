// app/api/users/students/route.ts

import { NextResponse } from "next/server";

// ✅ CRITICAL: Force dynamic rendering - NO CACHING
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://140.245.42.78:5050";
    
    // Add timestamp to bust cache on both client and server
    const timestamp = new Date().getTime();
    const url = new URL(request.url);
    
    console.log(`[API] Fetching students from backend... (${timestamp})`);
    
    // Call backend with no-cache headers
    const res = await fetch(`${backendUrl}/api/User?_t=${timestamp}`, {
      cache: 'no-store',
      next: { revalidate: 0 },
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });

    if (!res.ok) {
      console.error(`[API] Backend error: ${res.status}`);
      throw new Error(`Backend returned ${res.status}`);
    }

    const users = await res.json();
    console.log(`[API] Received ${Array.isArray(users) ? users.length : 0} users from backend`);

    // Filter students
    const students = Array.isArray(users) 
      ? users.filter((u: any) => {
          // Check multiple possible role structures
          const roleName = u.role?.roleName || u.roleName || u.role?.name;
          return roleName?.toLowerCase() === 'student';
        })
      : [];

    console.log(`[API] Filtered to ${students.length} students`);

    // Return with no-cache headers
    return new NextResponse(JSON.stringify(students), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
        'Pragma': 'no-cache',
      },
    });

  } catch (error: any) {
    console.error("[API] Fetch students error:", error);
    return NextResponse.json(
      { error: "Failed to fetch students", message: error.message },
      { status: 500 }
    );
  }
}