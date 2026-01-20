// lib/services/admin-users.service.ts
import type { Student } from "@/lib/types/admin-user";

export async function fetchStudents(): Promise<Student[]> {
  const ts = Date.now();
  const res = await fetch(`/api/users/students?_t=${ts}`, {
    cache: "no-store",
    headers: { "Cache-Control": "no-cache" },
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Failed to fetch students: ${res.status}`);
  return res.json();
}

export async function fetchLecturers(): Promise<Student[]> {
  const ts = Date.now();
  const res = await fetch(`/api/proxy/User/Lecturer?pageSize=100&_t=${ts}`, {
    cache: "no-store",
    headers: { "Cache-Control": "no-cache" },
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Failed to fetch lecturers: ${res.status}`);
  const data = await res.json();

  const items = data.items || (Array.isArray(data) ? data : []);
  return items.map((item: any) => ({
    id:
      item?.user?.id ||
      item?.userProfileViewModel?.userId ||
      item?.studentId ||
      "",
    username: item?.user?.username || "",
    email: item?.user?.email || "",
    userProfile: {
      fullName:
        item?.userProfileViewModel?.fullName || item?.user?.username || "",
      major: item?.userProfileViewModel?.major || null,
    },
    skillSet: item?.user?.skillSet || "",
  })) as Student[];
}

export async function importUsers(file: File, type: "student" | "lecturer") {
  const allowedExtensions = [".xlsx", ".xls", ".csv"];
  const isValid = allowedExtensions.some((ext) =>
    file.name.toLowerCase().endsWith(ext),
  );
  if (!isValid) throw new Error("Invalid file. Upload Excel/CSV only.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Max file size is 5MB");

  const endpoint =
    type === "student" ? "/api/users/import" : "/api/users/import-lecturer";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  const res = await fetch(endpoint, {
    method: "POST",
    body: formData,
    credentials: "include",
    cache: "no-store",
    headers: { "Cache-Control": "no-cache" },
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg = data?.message || data?.error || data?.title || "Import failed";
    throw new Error(msg);
  }
  return data;
}
