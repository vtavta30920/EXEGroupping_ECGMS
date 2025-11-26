// app/api/proxy/[...path]/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
export const dynamic = "force-dynamic";

// Hàm xử lý chung cho mọi Method (GET, POST, PUT, DELETE...)
async function handleProxy(request: Request, ctx: { params: any }) {
  // 1. Lấy path từ URL (ví dụ: /api/proxy/Course -> path: ['Course'])
  // Next 15: params là Dynamic API và cần await trước khi sử dụng
  const resolvedParams = await ctx.params;
  let path = (resolvedParams?.path ?? []).join("/");
  // Tránh lặp 'api' nếu client gửi '/api/proxy/api/...'
  if (path.startsWith("api/")) {
    path = path.slice(4); // remove leading 'api/'
  }

  // 2. Lấy Query Params (ví dụ: ?page=1&size=10)
  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();

  // 3. Xây dựng URL đích đến Backend thật
  // Kết quả: http://140.245.42.78:5050/api/Course?page=1
  const backendUrl = process.env.BACKEND_URL || "http://140.245.42.78:5050";
  const targetUrl = `${backendUrl}/api/${path}${
    queryString ? `?${queryString}` : ""
  }`;

  try {
    // 4. Lấy Token từ Cookie (Server-side)
    // Lưu ý: cookies() trong Next.js mới trả về Promise nên cần await
    const cookieStore = await cookies();
    const accessToken =
      cookieStore.get("auth_token")?.value ??
      cookieStore.get("accessToken")?.value;

    // 5. Chuẩn bị Headers
    const headers: HeadersInit = {
      // Forward các header cần thiết khác nếu cần
    };

    // Nếu có token trong cookie, đính kèm vào header Authorization gửi sang BE
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    // 6. Lấy Body (nếu có)
    let body = null;
    const isBodyAllowed = request.method !== "GET" && request.method !== "HEAD";
    if (isBodyAllowed) {
      try {
        body = await request.text();
        const reqContentType = request.headers.get("Content-Type");
        if (reqContentType) {
          headers["Content-Type"] = reqContentType;
        } else if (body) {
          headers["Content-Type"] = "application/json";
        }
      } catch (e) {
        // Body rỗng hoặc lỗi parse, bỏ qua
      }
    }

    // 7. Gọi Backend (Server-to-Server -> KHÔNG BỊ CORS)
    console.log(`[Proxy] Forwarding ${request.method} to: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: body,
      cache: "no-store", // Không cache API response để đảm bảo dữ liệu luôn mới
    });

    // 8. Trả kết quả về cho Client
    const status = response.status;
    const backendContentType =
      response.headers.get("Content-Type") || undefined;
    const proxyHeaders: HeadersInit = backendContentType
      ? { "Content-Type": backendContentType }
      : {};

    // Với 204/304, phải trả về response không có body
    if (status === 204 || status === 304) {
      return new NextResponse(null, {
        status,
        headers: {},
      });
    }

    const data = await response.text();
    return new NextResponse(data, {
      status,
      headers: proxyHeaders,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("[Proxy Error]", {
      message: errorMessage,
      stack: errorStack,
      targetUrl: `${backendUrl}/api/${path}${
        queryString ? `?${queryString}` : ""
      }`,
      method: request.method,
    });
    return NextResponse.json(
      {
        error: "Proxy Internal Error",
        message: errorMessage,
        targetUrl: `${backendUrl}/api/${path}${
          queryString ? `?${queryString}` : ""
        }`,
      },
      { status: 500 }
    );
  }
}

// Export các method hỗ trợ để Next.js nhận diện
export async function GET(req: Request, ctx: any) {
  return handleProxy(req, ctx);
}
export async function POST(req: Request, ctx: any) {
  return handleProxy(req, ctx);
}
export async function PUT(req: Request, ctx: any) {
  return handleProxy(req, ctx);
}
export async function DELETE(req: Request, ctx: any) {
  return handleProxy(req, ctx);
}
export async function PATCH(req: Request, ctx: any) {
  return handleProxy(req, ctx);
}
