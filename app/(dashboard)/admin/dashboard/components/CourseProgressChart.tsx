"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart"
import type { DashboardData } from "@/lib/types/dashboard"

export function CourseProgressChart({ data }: { data: DashboardData }) {
  // API trả groupProgress — đảm bảo fallback nếu undefined
  const progress = data?.groupProgress ?? []

  // Convert thành chart data
  const chartData = progress.map((p) => ({
    course: p.courseCode,
    "Đã có nhóm": p.hasGroup,
    "Chưa có nhóm": p.noGroup,
  }))

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Tiến độ ghép nhóm theo môn học
        </CardTitle>
        <CardDescription>
          Phân bổ số nhóm đã có người và chưa có nhóm
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer
          config={{
            "Đã có nhóm": { label: "Đã có nhóm", color: "hsl(var(--chart-1))" },
            "Chưa có nhóm": { label: "Chưa có nhóm", color: "hsl(var(--chart-2))" },
          }}
          className="w-full h-[320px]"
        >
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="course" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="Đã có nhóm" fill="var(--color-Đã có nhóm)" />
            <Bar dataKey="Chưa có nhóm" fill="var(--color-Chưa có nhóm)" />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
