// app/api/users/students/route.ts

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://140.245.42.78:5050";
    const timestamp = new Date().getTime();

    console.log(`[API] Fetching students from backend... (${timestamp})`);

    // Fetch first page to get totalPages
    const firstRes = await fetch(
      `${backendUrl}/api/User?pageNumber=1&pageSize=100&_t=${timestamp}`,
      {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );

    if (!firstRes.ok) {
      throw new Error(`Backend returned ${firstRes.status}`);
    }

    const firstData = await firstRes.json();
    let allUsers: any[] = [];

    // Handle paginated response: { items: [], totalPages, ... }
    if (firstData.items && Array.isArray(firstData.items)) {
      allUsers = [...firstData.items];
      const totalPages = firstData.totalPages || 1;

      console.log(`[API] Page 1/${totalPages}, got ${firstData.items.length} users`);

      // Fetch remaining pages
      if (totalPages > 1) {
        const promises = [];
        for (let page = 2; page <= totalPages; page++) {
          promises.push(
            fetch(
              `${backendUrl}/api/User?pageNumber=${page}&pageSize=100&_t=${timestamp}`,
              { cache: "no-store" }
            ).then((r) => r.json())
          );
        }
        const results = await Promise.all(promises);
        for (const data of results) {
          if (data.items && Array.isArray(data.items)) {
            allUsers.push(...data.items);
          }
        }
      }
    } else if (Array.isArray(firstData)) {
      allUsers = firstData;
    }

    console.log(`[API] Total users fetched: ${allUsers.length}`);

    // Filter students only
    const students = allUsers.filter((u: any) => {
      const roleName = u.role?.roleName || u.roleName || u.role?.name;
      return roleName?.toLowerCase() === "student";
    });

    console.log(`[API] Filtered to ${students.length} students`);

    return new NextResponse(JSON.stringify(students), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, max-age=0",
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