import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://140.245.42.78:5050/api";

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/Group/GetAllGroups`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("Group API Error:", response.status, errorText);
      return NextResponse.json(
        {
          error: "Failed to fetch groups",
          status: response.status,
          message:
            errorText || `HTTP error when fetching groups: ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in groups API route:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch groups",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Thêm method POST để tạo nhóm (dùng cho Wizard)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetch(`${API_BASE_URL}/Group/CreateGroup`, { // Kiểm tra đúng endpoint backend
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error('Backend error');
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
  }
}
