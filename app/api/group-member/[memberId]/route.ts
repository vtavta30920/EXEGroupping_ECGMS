import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://140.245.42.78:5050/api";

interface RouteParams {
  params: {
    memberId: string;
  };
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { memberId } = params;

  try {
    const response = await fetch(`${API_BASE_URL}/GroupMember/${memberId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error(
        "GroupMember DELETE API Error:",
        response.status,
        errorText
      );
      return NextResponse.json(
        {
          error: "Failed to remove member from group",
          status: response.status,
          message:
            errorText ||
            `HTTP error when removing member from group: ${response.status}`,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: "Member removed from group successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in group-member DELETE API route:", error);
    return NextResponse.json(
      {
        error: "Failed to remove member from group",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
