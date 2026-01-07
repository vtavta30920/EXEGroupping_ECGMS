import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"

interface GroupInfoCardProps {
  loading: boolean;
  group: any;
}

export function GroupInfoCard({ loading, group }: GroupInfoCardProps) {
  const router = useRouter()

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" /> Thông tin Nhóm
        </CardTitle>
        <CardDescription>Nhóm hiện tại và mentor hướng dẫn</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-24 w-full" />
        ) : group ? (
          <div className="space-y-2">
            <div className="font-semibold">{group.groupName}</div>
            <div className="text-sm text-gray-600">Trạng thái: {group.status}</div>
            <div className="text-sm text-gray-600">Mentor: {group.lecturerName || '—'}</div>
            <div className="pt-2">
              <Button onClick={() => router.push(`/student/groups/${group.groupId}`)}>
                Xem nhóm của tôi
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-600">Chưa tham gia nhóm</div>
        )}
      </CardContent>
    </Card>
  )
}
