// app/api/users/import/route.ts
import { NextRequest, NextResponse } from "next/server";

// Friendly error mapping
function getUserFriendlyError(status: number, backendMessage: string, details?: any): string {
  backendMessage = backendMessage?.toLowerCase() || "";

  if (backendMessage.includes("corrupted") || backendMessage.includes("invalid format")) {
    return "File không hợp lệ hoặc bị hỏng. Vui lòng kiểm tra lại.";
  }

  if (backendMessage.includes("column")) {
    return "Sai hoặc thiếu tên cột. Vui lòng kiểm tra tiêu đề file.";
  }

  if (backendMessage.includes("duplicate") || backendMessage.includes("exists")) {
    return "Dữ liệu bị trùng. Vui lòng kiểm tra lại file.";
  }

  const map: Record<number, string> = {
    400: "File hoặc dữ liệu không hợp lệ",
    401: "Bạn chưa đăng nhập",
    403: "Bạn không có quyền",
    413: "File quá lớn (max 5MB)",
    415: "File không được hỗ trợ",
    500: "Lỗi máy chủ",
  };

  return map[status] || backendMessage || "Lỗi không xác định";
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!type || !["student", "lecturer"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be 'student' or 'lecturer'" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File exceeds 5MB limit" },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_URL || "http://140.245.42.78:5050";

    // 🔥 Mapping to backend API
    const endpointMap: Record<string, string> = {
      student: "/api/User/import-students",
      lecturer: "/api/User/import-lecturer",
    };

    const endpoint = endpointMap[type];

    // Build backend FormData (must use Blob)
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], {
      type:
        file.type ||
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const backendFormData = new FormData();
    backendFormData.append("file", blob, file.name);

    // Call backend
    const response = await fetch(`${backendUrl}${endpoint}`, {
      method: "POST",
      body: backendFormData,
    });

    // Read body only 1 time
    const raw = await response.text();

    let parsed: any = {};
    try {
      parsed = raw ? JSON.parse(raw) : {};
    } catch {
      parsed = { message: raw || null };
    }

    // ❌ Backend error
    if (!response.ok) {
      const backendMessage =
        parsed?.message ||
        parsed?.error ||
        parsed?.title ||
        raw ||
        "Backend error";

      return NextResponse.json(
        {
          error: getUserFriendlyError(response.status, backendMessage, parsed),
          backendMessage,
          details: parsed,
          statusCode: response.status,
        },
        { status: response.status }
      );
    }

    // ✅ Success
    return NextResponse.json({
      success: true,
      type,
      message: parsed?.message || `Import ${type} completed successfully`,
      data: parsed,
    });
  } catch (error: any) {
    console.error("[Import Proxy Critical Error]", error);
    return NextResponse.json(
      {
        error: "Server error during import",
        message: error?.message,
      },
      { status: 500 }
    );
  }
}
