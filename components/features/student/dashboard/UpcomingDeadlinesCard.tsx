import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Calendar } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Task } from "@/lib/types"

interface UpcomingDeadlinesCardProps {
  loading: boolean;
  tasks: Task[];
}

export function UpcomingDeadlinesCard({ loading, tasks }: UpcomingDeadlinesCardProps) {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" /> Deadline sắp tới
        </CardTitle>
        <CardDescription>3 công việc gần nhất</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-24 w-full" />
        ) : tasks.length === 0 ? (
          <div className="text-sm text-gray-600">Không có deadline trong tuần này</div>
        ) : (
          <div className="space-y-2">
            {tasks.map(t => (
              <div key={t.taskId} className="flex items-center justify-between text-sm">
                <div className="font-medium truncate mr-2">{t.taskName}</div>
                <div className="text-gray-600">
                  {new Date(t.dueDate).toLocaleDateString('vi-VN')}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
