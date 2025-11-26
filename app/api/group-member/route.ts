import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://140.245.42.78:5050/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/GroupMember`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // Cố gắng parse JSON error từ backend
      let errorMessage = "";
      try {
        const cloned = response.clone();
        const errorJson: any = await cloned.json();
        if (errorJson) {
          if (typeof errorJson.message === "string") {
            errorMessage = errorJson.message;
          } else if (typeof errorJson.error === "string") {
            errorMessage = errorJson.error;
          } else if (typeof errorJson === "string") {
            errorMessage = errorJson;
          }
        }
      } catch {
        // Nếu không parse được JSON, thử lấy text
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        } catch {
          // ignore
        }
      }

      // Nếu không có message, dùng message mặc định
      if (!errorMessage) {
        if (response.status === 400) {
          errorMessage = "Nhóm đã đạt số lượng thành viên tối đa";
        } else {
          errorMessage = `HTTP error when adding member to group: ${response.status}`;
        }
      }

      console.error("GroupMember API Error:", response.status, errorMessage);
      return NextResponse.json(
        {
          error: "Failed to add member to group",
          status: response.status,
          message: errorMessage,
        },
        { status: response.status }
      );
    }

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in group-member API route:", error);
    return NextResponse.json(
      {
        error: "Failed to add member to group",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
