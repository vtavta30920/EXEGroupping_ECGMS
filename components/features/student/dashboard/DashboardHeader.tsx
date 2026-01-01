import { User } from "@/lib/types"

interface DashboardHeaderProps {
  user: User | null;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Xin chào, {user?.fullName || 'Sinh viên'}!
        </h1>
        <p className="text-gray-600 mt-1">Trang tổng quan học tập và dự án</p>
      </div>
    </div>
  )
}
