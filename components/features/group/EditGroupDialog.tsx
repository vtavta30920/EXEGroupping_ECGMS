"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { mockUsers } from "@/lib/mock-data/auth"
import { LecturerCourseService, UserService } from "@/lib/api/generated"

type Props = {
  isOpen: boolean
  onClose: () => void
  groupId: string
  groupName: string
  courseId: string
  courseCode: string
  useMock: boolean
  onSuccess?: (newLecturerId: string) => void
}

export function EditGroupDialog({ isOpen, onClose, groupId, groupName, courseId, courseCode, useMock, onSuccess }: Props) {
  const { toast } = useToast()
  const [lecturers, setLecturers] = React.useState<{ id: string; name: string }[]>([])
  const [selectedLecturerId, setSelectedLecturerId] = React.useState<string>("")
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (!isOpen) return
    ;(async () => {
      try {
        if (useMock) {
          const list = mockUsers.filter(u => u.role === 'lecturer').map(u => ({ id: u.userId, name: u.fullName }))
          setLecturers(list)
        } else {
          const users = await UserService.getApiUser()
          const list = (users || [])
            .filter(u => (u.role?.roleName || '').toLowerCase() === 'lecturer')
            .map(u => ({ id: u.id || '', name: u.userProfile?.fullName || u.username || u.email || '—' }))
          setLecturers(list)
        }
      } catch (err) {
        setLecturers([])
        toast({ title: "Lỗi", description: "Không thể tải danh sách giảng viên." })
      }
    })()
  }, [isOpen, useMock, toast])

  const handleSave = async () => {
    if (!selectedLecturerId) {
      toast({ title: "Thiếu thông tin", description: "Vui lòng chọn giảng viên phụ trách." })
      return
    }
    setSubmitting(true)
    try {
      if (useMock) {
        onSuccess?.(selectedLecturerId)
        toast({ title: "Đã cập nhật", description: `Đã gán giảng viên cho khoá ${courseCode}.` })
        onClose()
      } else {
        // Tìm mapping LecturerCourse theo courseId
        const existing = await LecturerCourseService.getApiLecturerCourseByCourses({ coursesId: courseId })
        let existingId: string | null = null
        if (Array.isArray(existing) && existing.length > 0) {
          existingId = existing[0]?.id || null
        } else if (existing && typeof existing === 'object') {
          existingId = (existing as any).id || null
        }

        if (existingId) {
          await LecturerCourseService.putApiLecturerCourse({ id: existingId, requestBody: { courseId, lecturerId: selectedLecturerId } })
        } else {
          await LecturerCourseService.postApiLecturerCourse({ requestBody: { courseId, lecturerId: selectedLecturerId } })
        }
        onSuccess?.(selectedLecturerId)
        toast({ title: "Đã cập nhật", description: `Đã gán giảng viên cho khoá ${courseCode}.` })
        onClose()
      }
    } catch (err: any) {
      toast({ title: "Lỗi", description: err?.message || "Không thể cập nhật giảng viên." })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sửa nhóm: {groupName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Lecturer phụ trách</Label>
            <Select value={selectedLecturerId} onValueChange={setSelectedLecturerId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn giảng viên" />
              </SelectTrigger>
              <SelectContent>
                {lecturers.map(l => (
                  <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onClose()} disabled={submitting}>Hủy</Button>
          <Button onClick={handleSave} disabled={submitting || !selectedLecturerId}>
            {submitting ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}