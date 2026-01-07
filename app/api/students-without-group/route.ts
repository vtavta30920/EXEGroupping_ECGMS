import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://140.245.42.78:5050/api";

export async function GET(request: NextRequest) {
  try {
    // First, get the first page to know total count
    const firstResponse = await fetch(`${API_BASE_URL}/User/UserWithoutGroup?pageNumber=1&pageSize=100`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!firstResponse.ok) {
      const errorText = await firstResponse.text();
      console.error("API Error:", firstResponse.status, errorText);
      return NextResponse.json(
        { 
          error: "Failed to fetch students",
          status: firstResponse.status,
          message: errorText || `HTTP error! status: ${firstResponse.status}`
        },
        { status: firstResponse.status }
      );
    }

    const firstData = await firstResponse.json();
    const totalCount = firstData.totalCount || 0;
    const totalPages = firstData.totalPages || 1;
    let allStudents = firstData.items || [];

    // If there are more pages, fetch them all
    if (totalPages > 1) {
      const pagePromises = [];
      for (let page = 2; page <= totalPages; page++) {
        pagePromises.push(
          fetch(`${API_BASE_URL}/User/UserWithoutGroup?pageNumber=${page}&pageSize=100`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }).then(res => res.json())
        );
      }

      const remainingPages = await Promise.all(pagePromises);
      remainingPages.forEach(pageData => {
        if (pageData.items) {
          allStudents = allStudents.concat(pageData.items);
        }
      });
    }

    return NextResponse.json(allStudents);
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

