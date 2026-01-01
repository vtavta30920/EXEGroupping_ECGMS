import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"

export function NotificationCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Thông báo & Tin tức</span>
          <Badge>Sắp ra mắt</Badge>
        </CardTitle>
        <CardDescription>Cập nhật mới nhất từ giảng viên và hệ thống</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center h-48 text-center space-y-3">
        <div className="bg-gray-100 p-3 rounded-full">
          <AlertTriangle className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm text-muted-foreground max-w-xs">
          Tính năng thông báo đang được phát triển.
        </p>
      </CardContent>
    </Card>
  )
}
