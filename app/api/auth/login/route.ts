import { type NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://140.245.42.78:5050";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const requestPayload = {
      email: body.email || body.username,
      password: body.password || "",
    };

    console.log("[v0] Login request payload:", requestPayload);
    console.log("[v0] Backend URL:", `${BACKEND_URL}/api/User/login`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${BACKEND_URL}/api/User/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log("[v0] Backend response status:", response.status);
    console.log("[v0] Backend response ok:", response.ok);
    console.log("[v0] Response headers:", {
      contentType: response.headers.get("content-type"),
      contentLength: response.headers.get("content-length"),
    });

    // Read response text
    const responseText = await response.text();
    console.log("[v0] Backend response text length:", responseText.length);
    console.log(
      "[v0] Backend response (first 500 chars):",
      responseText.substring(0, 500)
    );

    if (!responseText || responseText.trim() === "") {
      console.error("[v0] Empty response from backend");
      return NextResponse.json(
        { error: "Server trả về response rỗng" },
        { status: 500 }
      );
    }

    // Parse JSON
    let data: any;
    try {
      data = JSON.parse(responseText);
      console.log("[v0] Parsed response data keys:", Object.keys(data));
    } catch (parseError) {
      console.error("[v0] Failed to parse response:", parseError);
      console.error("[v0] Response text:", responseText);
      return NextResponse.json(
        { error: "Phản hồi từ server không hợp lệ (JSON parse failed)" },
        { status: 500 }
      );
    }

    if (data.token) {
      console.log("[v0] ✅ Login successful - token received");

      // Set HTTP-only cookie for token
      const res = NextResponse.json(data);
      res.cookies.set("auth_token", data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return res;
    }

    // Backend might return validation errors even with 200 status
    if (!response.ok) {
      console.error("[v0] ❌ Backend returned non-OK status:", response.status);

      let errorMessage = "Đăng nhập thất bại";

      // Try to extract error from response
      if (data.message) {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage = data.error;
      } else if (data.title) {
        errorMessage = data.title;
      } else if (data.errors && typeof data.errors === "object") {
        const validationErrors: string[] = [];
        for (const key in data.errors) {
          if (Array.isArray(data.errors[key])) {
            validationErrors.push(...data.errors[key]);
          } else if (typeof data.errors[key] === "string") {
            validationErrors.push(data.errors[key]);
          }
        }
        if (validationErrors.length > 0) {
          errorMessage = validationErrors.join(", ");
        }
      }

      return NextResponse.json(
        { error: errorMessage, details: data },
        { status: response.status || 400 }
      );
    }

    if (!data.token) {
      console.error("[v0] ❌ No token in successful response:", data);
      return NextResponse.json(
        {
          error: "Phản hồi từ server không chứa token",
          details: data,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[v0] Login API error:", error);

    if (error.name === "AbortError") {
      return NextResponse.json(
        { error: "Yêu cầu timeout - server không phản hồi" },
        { status: 504 }
      );
    }

    if (error.message?.includes("ECONNREFUSED")) {
      return NextResponse.json(
        { error: "Không thể kết nối đến server backend" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Lỗi máy chủ nội bộ" },
      { status: 500 }
    );
  }
}
