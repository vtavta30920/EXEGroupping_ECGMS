import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://140.245.42.78:5050/api";

interface RouteParams {
  params: Promise<{
    groupId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { groupId } = await params;

  try {
    const response = await fetch(
      `${API_BASE_URL}/Group/GetGroupBy/${groupId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (response.status === 404) {
      return NextResponse.json(
        { error: "Group not found", status: 404 },
        { status: 404 }
      );
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("Group detail API Error:", response.status, errorText);
      return NextResponse.json(
        {
          error: "Failed to fetch group detail",
          status: response.status,
          message:
            errorText ||
            `HTTP error when fetching group detail: ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in group detail API route:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch group detail",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
