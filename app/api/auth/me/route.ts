// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://140.245.42.78:5050";
    
    // SỬA LỖI: Thêm 'await' trước cookies()
    const cookieStore = await cookies();
    
    // Lấy token (đảm bảo tên cookie khớp với file login, ví dụ 'auth_token')
    const token = cookieStore.get("auth_token")?.value; 

    // Nếu không có token, trả về null (chưa đăng nhập)
    if (!token) {
        return NextResponse.json(null);
    }

    // Gọi Backend để lấy thông tin User
    // (Endpoint này cần Backend hỗ trợ, ví dụ /api/Auth/me hoặc xác thực token)
    const res = await fetch(`${backendUrl}/api/Auth/me`, {
      headers: {
        "Authorization": `Bearer ${token}`
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      return NextResponse.json(null);
    }

    const user = await res.json();
    return NextResponse.json(user);

  } catch (error) {
    console.error("[Auth Proxy] Failed to fetch user:", error);
    return NextResponse.json(null, { status: 500 });
  }
}