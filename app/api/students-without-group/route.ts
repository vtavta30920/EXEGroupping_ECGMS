import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://140.245.42.78:5050/api";

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/User/UserWithoutGroup`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Add cache control to avoid stale data
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", response.status, errorText);
      return NextResponse.json(
        { 
          error: "Failed to fetch students",
          status: response.status,
          message: errorText || `HTTP error! status: ${response.status}`
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch students",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

