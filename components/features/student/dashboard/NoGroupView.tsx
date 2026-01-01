import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

interface NoGroupViewProps {
  activeCourses: any[];
  selectedCourseCode: string;
  loadingGroups: boolean;
  availableGroups: any[];
  onSelectCourse: (code: string) => void;
  onJoinGroup: (groupId: string) => void;
}

export function NoGroupView({
  activeCourses,
  selectedCourseCode,
  loadingGroups,
  availableGroups,
  onSelectCourse,
  onJoinGroup
}: NoGroupViewProps) {
  const router = useRouter()

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" /> Bạn chưa tham gia nhóm
        </CardTitle>
        <CardDescription>
          Hãy tham gia nhóm để bắt đầu dự án. Danh sách môn học đang mở hiển thị bên dưới.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="text-sm font-medium">Chọn môn để tìm nhóm</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {activeCourses.map(c => (
                <Button
                  key={c.courseId}
                  variant={selectedCourseCode === (c.courseCode || '') ? 'outline' : 'ghost'}
                  onClick={() => onSelectCourse(c.courseCode || '')}
                >
                  {c.courseCode} — {c.courseName}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Button 
              className="bg-amber-600 hover:bg-amber-700" 
              onClick={() => router.push('/student/group')}
            >
              Tìm nhóm theo thao tác
            </Button>
          </div>
        </div>
        <div className="mt-4">
          <div className="text-sm font-medium mb-2">
            Danh sách nhóm cho: {selectedCourseCode || '—'}
          </div>
          {loadingGroups ? (
            <div>Đang tải danh sách nhóm…</div>
          ) : (
            <div className="space-y-2">
              {availableGroups.length === 0 ? (
                <div className="text-sm text-gray-500">
                  Chưa có nhóm. Hãy chọn môn khác hoặc tạo nhóm mới.
                </div>
              ) : (
                availableGroups.map((g: any) => (
                  <div key={g.groupId || g.raw?.id || g.raw?.Id || Math.random()} className="p-3 border rounded flex items-center justify-between">
                    <div>
                      <div className="font-medium">{g.name || g.raw?.groupName || g.raw?.name}</div>
                      <div className="text-sm text-gray-600">
                        {(g.memberCount ?? g.raw?.memberCount ?? (Array.isArray(g.raw?.members) ? g.raw.members.length : 0))} thành viên
                      </div>
                    </div>
                    <div>
                      <Button size="sm" onClick={() => onJoinGroup(g.groupId || g.raw?.id || g.raw?.Id)}>
                        Tham gia
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
