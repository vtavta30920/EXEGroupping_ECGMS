import { User } from "@/lib/types";

interface DashboardHeaderProps {
  user: User | null;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  // Tạo tên hiển thị thân thiện
  const getDisplayName = (user: User | null): string => {
    if (!user) return "Sinh viên";

    // Ưu tiên fullName, nếu không có thì dùng username
    const fullName = user.fullName?.trim();
    const username = user.username?.trim();

    if (fullName && !fullName.includes("@") && fullName !== username) {
      return fullName;
    }

    return username || "Sinh viên";
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Xin chào, {getDisplayName(user)}!
        </h1>
        <p className="text-gray-600 mt-1">Trang tổng quan học tập và dự án</p>
      </div>
    </div>
  );
}
