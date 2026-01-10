"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { DashboardData } from "@/lib/types/dashboard"

export function AttentionSection({ data }: { data: DashboardData }) {
  // 🔹 Sử dụng warnings đúng từ DashboardData
  const lowMemberGroups = data?.warnings?.groupsMissingMembers ?? []
  const coursesNoMentor = data?.warnings?.coursesNoMentor ?? []

  // Ẩn toàn bộ mục nếu không có cảnh báo nào
  if ((lowMemberGroups?.length ?? 0) === 0 && (coursesNoMentor?.length ?? 0) === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Cần chú ý
        </CardTitle>
        <CardDescription>Nhóm thiếu người hoặc môn chưa có mentor</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">

        {/* Nhóm thiếu người */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Nhóm đang thiếu người</p>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nhóm</TableHead>
                <TableHead>Môn</TableHead>
                <TableHead>Thành viên</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {lowMemberGroups.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-4">
                    Không có nhóm nào thiếu người
                  </TableCell>
                </TableRow>
              )}

              {lowMemberGroups.map((g) => (
                <TableRow key={g.groupId}>
                  <TableCell className="font-medium">{g.groupName}</TableCell>
                  <TableCell>{g.courseCode}</TableCell>
                  <TableCell>
                    <Badge>{g.memberCount}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline">Ghép nhanh</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Môn thiếu mentor */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Môn chưa có Mentor</p>

          <div className="flex flex-wrap gap-2">
            {coursesNoMentor.length === 0 && (
              <span className="text-gray-500 text-sm">Tất cả môn đã có mentor</span>
            )}

            {coursesNoMentor.map((c) => (
              <Badge key={c.courseCode} variant="secondary">
                {c.courseCode}
              </Badge>
            ))}
          </div>
        </div>

      </CardContent>
    </Card>
  )
}
