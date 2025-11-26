// app/api/users/import/route.ts
import { NextRequest, NextResponse } from "next/server";

// Helper function for user-friendly error messages
function getUserFriendlyError(status: number, backendMessage: string, details?: any): string {
  const lower = (backendMessage || "").toLowerCase();

  if (lower.includes("corrupted") || lower.includes("invalid format")) {
    return "File không hợp lệ hoặc bị hỏng. Vui lòng kiểm tra:\n" +
           "- File Excel (.xlsx) hợp lệ\n" +
           "- Đủ các cột yêu cầu\n" +
           "- Dữ liệu đúng định dạng";
  }

  if (lower.includes("column")) {
    return "Thiếu hoặc sai tên cột. Vui lòng đảm bảo file có đúng tiêu đề cột yêu cầu.";
  }

  if (lower.includes("duplicate") || lower.includes("already exists") || lower.includes("exists")) {
    const names = new Set<string>(); 

    if (details && typeof details === 'object') {
      const tryCollect = (item: any) => {
        if (!item) return;
        const n = item.fullName || item.name || item.username || item.email || item.studentCode;
        if (n && typeof n === 'string') names.add(String(n).trim());
      };

      if (Array.isArray(details?.duplicates)) details.duplicates.forEach(tryCollect);
      if (Array.isArray(details?.errors)) details.errors.forEach((e: any) => tryCollect(e?.record || e?.item || e));
      if (Array.isArray(details?.items)) details.items.forEach(tryCollect);
      if (details?.user || details?.record || details?.student) tryCollect(details.user || details.record || details.student);
    }

    if (names.size === 0 && backendMessage) {
      const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
      const emails = backendMessage.match(emailRegex) || [];
      emails.forEach(e => names.add(e));

      const codeRegex = /\b[A-Z]{2,3}\d{6,8}\b/g;
      const codes = backendMessage.match(codeRegex) || [];
      codes.forEach(c => names.add(c));

      const usernameRegex = /\b[a-z]+[a-z]{2,4}[A-Z]{2,3}\d{6,8}\b/g;
      const usernames = backendMessage.match(usernameRegex) || [];
      usernames.forEach(u => names.add(u));
      
      const userMentionRegex = /username\s*[:=]\s*([\w.-]+)/gi;
      let match;
      while ((match = userMentionRegex.exec(backendMessage)) !== null) {
        if (match[1]) names.add(match[1]);
      }
    }

    const nameArray = Array.from(names);
    if (nameArray.length > 0) {
      const displayNames = nameArray.slice(0, 5).join(", ");
      const suffix = nameArray.length > 5 ? ` và ${nameArray.length - 5} sinh viên khác` : "";
      return `Đã có Sinh viên ${displayNames}${suffix} trong danh sách`;
    }
    
    return "Đã có Sinh viên trùng trong danh sách. Vui lòng loại bỏ bản ghi trùng và thử lại.";
  }

  const errorMap: Record<number, string> = {
    400: "Dữ liệu hoặc định dạng file không hợp lệ",
    401: "Cần đăng nhập để thực hiện nhập dữ liệu",
    403: "Bạn không có quyền nhập dữ liệu",
    413: "File vượt quá giới hạn dung lượng",
    415: "Loại file không được hỗ trợ",
    500: "Đã xảy ra lỗi phía máy chủ",
  };

  return errorMap[status] || backendMessage || "Đã xảy ra lỗi không xác định";
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 });
    }

    const backendUrl = process.env.BACKEND_URL || "http://140.245.42.78:5050";
    let endpoint = "";

    // Chỉ xử lý Student, bỏ Lecturer
    if (type === "student") {
      endpoint = "/api/User/import-students";
    } else {
      return NextResponse.json(
        { error: "Invalid import type. Only 'student' is supported." },
        { status: 400 }
      );
    }

    console.log(`[Import Proxy] Starting upload...`);
    console.log(`   - File: ${file.name}`);
    console.log(`   - Endpoint: ${backendUrl}${endpoint}`);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const backendFormData = new FormData();
    const backendFile = new File([buffer], file.name, {
      type: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    
    backendFormData.append("file", backendFile);

    const response = await fetch(`${backendUrl}${endpoint}`, {
      method: "POST",
      body: backendFormData,
    });

    console.log(`[Backend Response] Status: ${response.status}`);

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = "Backend error occurred";
      let errorDetails = null;

      if (contentType?.includes("application/json")) {
        try {
          const json = await response.json();
          errorDetails = json;
          errorMessage = json.message || json.title || JSON.stringify(json);
        } catch (e) {
          errorMessage = await response.text();
        }
      } else {
        errorMessage = await response.text();
      }

      console.error(`[Backend Error]`, {
        status: response.status,
        message: errorMessage,
        details: errorDetails,
      });

      const userMessage = getUserFriendlyError(response.status, errorMessage, errorDetails);

      return NextResponse.json(
        { 
          error: userMessage,
          details: errorDetails,
          statusCode: response.status 
        },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type");
    let result;
    
    if (contentType?.includes("application/json")) {
       result = await response.json();
    } else {
       const text = await response.text();
       result = { message: text || "Import successful" };
    }
    
    return NextResponse.json({
      success: true,
      message: "Import completed successfully",
      data: result,
    });

  } catch (error: any) {
    console.error("[Proxy Critical Error]:", error);
    return NextResponse.json(
      {
        error: "Server error during import",
        message: error.message,
      },
      { status: 500 }
    );
  }
}