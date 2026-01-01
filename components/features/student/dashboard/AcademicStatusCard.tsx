import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface AcademicStatusCardProps {
  loading: boolean;
  gpa: number;
}

export function AcademicStatusCard({ loading, gpa }: AcademicStatusCardProps) {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5" /> Tình trạng Học tập
        </CardTitle>
        <CardDescription>GPA tạm tính và tiến độ</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <div className="space-y-2">
            <div className="text-3xl font-bold">{gpa}</div>
            <div className="text-sm text-gray-600">GPA tạm tính dựa trên điểm có sẵn</div>
            <Badge variant="secondary" className="mt-2">Dữ liệu mẫu</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
