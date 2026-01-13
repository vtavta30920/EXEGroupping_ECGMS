"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { LecturerCourseService, UserService } from "@/lib/api/generated"
import { GroupService } from "@/lib/api/groupService"

type Props = {
  isOpen: boolean
  onClose: () => void
  groupId: string
  groupName: string
  courseId: string
  courseCode: string
  onSuccess?: (newLecturerId: string) => void
  initialLecturerId?: string
}

export function EditGroupDialog({ isOpen, onClose, groupId, groupName, courseId, courseCode, onSuccess, initialLecturerId }: Props) {
  const { toast } = useToast()
  const [lecturers, setLecturers] = React.useState<{ id: string; name: string }[]>([])
  const [selectedLecturerId, setSelectedLecturerId] = React.useState<string>("")
  const [submitting, setSubmitting] = React.useState(false)
  const [rawResponse, setRawResponse] = React.useState<any>(null)

  React.useEffect(() => {
    if (!isOpen) {
      setSelectedLecturerId("")
      return
    }
    console.log('🔄 [EditGroupDialog] useEffect triggered:', { isOpen, courseId, groupId, groupName });
    ;(async () => {
      try {
          // Load lecturers by course using the new method
          if (courseId) {
              console.log('📡 [EditGroupDialog] Loading lecturers for courseId:', courseId);
              // First, fetch raw response for debugging and mapping
              const raw = await GroupService.getLecturersRaw(courseId)
              console.log('📦 [EditGroupDialog] Raw LecturerCourse response:', raw)
              setRawResponse(raw)

              // Try to map raw response directly if it looks like the format we expect
              // Backend format: { lecturer: { id: "GUID", username: "ngocttm4", fullname: "Trương Thị Mỹ Ngọc" }, ... }
              let mapped: { id: string; name: string }[] = []
              try {
                const arr = Array.isArray(raw) ? raw : (raw?.items || raw?.value || raw?.$values || (raw ? [raw] : []))
                if (Array.isArray(arr) && arr.length > 0) {
                  const mapTemp = new Map<string, string>()
                  arr.forEach((it: any) => {
                    // Use lecturerId (new API field) as the primary ID, then lecturer.lecturerId, then lecturer.id, then username
                    const id = it?.lecturerId || it?.lecturer?.lecturerId || it?.lecturer?.id || it?.lecturer?.username || it?.id
                    // Prefer fullname, fallback to lecturer.fullname, username, then id
                    const name = it?.lecturer?.fullname || it?.lecturer?.fullName || it?.lecturer?.username || id || ''
                    if (id) {
                      console.log('   [Mapping item] lecturerId:', it?.lecturerId || it?.lecturer?.lecturerId, 'lecturer.id:', it?.lecturer?.id, 'username:', it?.lecturer?.username, 'fullname:', it?.lecturer?.fullname, 'resolved id:', id, 'name:', name)
                      mapTemp.set(String(id), name || String(id))
                    }
                  })
                  mapped = Array.from(mapTemp.entries()).map(([id, name]) => ({ id, name }))
                  console.log('🔁 [EditGroupDialog] Mapped from raw response (count):', mapped.length, 'data:', mapped)
                }
              } catch (mapErr) {
                console.warn('⚠️ [EditGroupDialog] Error mapping raw response:', mapErr)
              }

              if (mapped.length > 0) {
                console.log('✅ [EditGroupDialog] Using mapped lecturers from raw response - count:', mapped.length)
                setLecturers(mapped)
                if (initialLecturerId && mapped.some(l => l.id === initialLecturerId)) {
                  setSelectedLecturerId(initialLecturerId)
                }
              } else {
                // Fallback to existing service that applies other heuristics
                const list = await GroupService.getLecturersByCourse(courseId)
                console.log('✅ [EditGroupDialog] Lecturers loaded from service - count:', list.length, 'data:', list);
                if (list.length === 0) {
                  console.warn('⚠️ [EditGroupDialog] No lecturers returned from API, showing warning');
                  toast({ title: "Cảnh báo", description: "Không tìm thấy giảng viên cho môn học này." })
                }
                console.log('🔁 [EditGroupDialog] Setting lecturers (count):', list.length)
                setLecturers(list)
                if (initialLecturerId && list.some(l => l.id === initialLecturerId)) {
                  console.log('🔁 [EditGroupDialog] Preselecting initial lecturerId:', initialLecturerId)
                  setSelectedLecturerId(initialLecturerId)
                }
              }
            } else {
            console.warn('⚠️ [EditGroupDialog] No courseId provided (empty:', !courseId, '), using fallback');
            // Fallback to all lecturers if no courseId
            console.log('📡 [EditGroupDialog] Fetching all lecturers as fallback...');
            const users = await UserService.getApiUser()
            const list = (users || [])
              .filter(u => (u.role?.roleName || '').toLowerCase() === 'lecturer')
              .map(u => ({ id: u.id || '', name: u.userProfile?.fullName || u.username || u.email || '—' }))
            console.log('✅ [EditGroupDialog] Fallback lecturers loaded - count:', list.length, 'data:', list);
            setLecturers(list)
            // Preselect if initial provided
            if (initialLecturerId && list.some(l => l.id === initialLecturerId)) {
              setSelectedLecturerId(initialLecturerId)
            }
          }
      } catch (err) {
        console.error('❌ [EditGroupDialog] Failed to load lecturers:', err)
        console.error('   Error stack:', (err as any)?.stack);
        setLecturers([])
        toast({ title: "Lỗi", description: "Không thể tải danh sách giảng viên." })
      }
    })()
  }, [isOpen, courseId, toast])

  // Log changes to lecturers state for debugging
  React.useEffect(() => {
    console.log('🔍 [EditGroupDialog] lecturers state changed:', { count: lecturers.length, lecturers })
  }, [lecturers])

  const handleSave = async () => {
    if (!selectedLecturerId) {
      toast({ title: "Thiếu thông tin", description: "Vui lòng chọn giảng viên phụ trách." })
      return
    }
    console.log('💾 [EditGroupDialog] handleSave called:', { groupId, selectedLecturerId, groupName })
    setSubmitting(true)
    try {
        // Update group lecturer using the new API
        console.log('🔄 [EditGroupDialog] Calling updateGroupLecturer with:', { groupId, lecturerId: selectedLecturerId })
        await GroupService.updateGroupLecturer(groupId, selectedLecturerId)
        console.log('✅ [EditGroupDialog] updateGroupLecturer succeeded')
        onSuccess?.(selectedLecturerId)
        toast({ title: "Đã cập nhật", description: `Đã gán giảng viên cho nhóm ${groupName}.` })
        onClose()
    } catch (err: any) {
      console.error('Failed to update group lecturer:', err)
      console.error('   Details:', { groupId, selectedLecturerId, errorMessage: err?.message })
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
            <Label>Lecturer phụ trách {lecturers.length > 0 ? `(${lecturers.length})` : '(No data)'}</Label>
            {lecturers.length === 0 && (
              <div className="text-sm text-amber-600 mb-2">⚠️ Không có dữ liệu giảng viên. Đang load...</div>
            )}
            <Select value={selectedLecturerId} onValueChange={setSelectedLecturerId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={lecturers.length === 0 ? "Không có giảng viên" : "Chọn giảng viên"} />
              </SelectTrigger>
              <SelectContent>
                {lecturers.length > 0 ? (
                  lecturers.map(l => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-gray-500">Không có dữ liệu</div>
                )}
              </SelectContent>
            </Select>
            {/* Debug panel: show raw and processed lecturer data */}
            <details className="text-sm text-gray-600 mt-3">
              <summary className="cursor-pointer font-medium">Debug: Lecturers ({lecturers.length}) / Raw response</summary>
              <div className="mt-2 space-y-2">
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-1">Processed Lecturers:</div>
                  <pre className="whitespace-pre-wrap break-words p-2 bg-gray-50 rounded text-xs max-h-40 overflow-y-auto">{JSON.stringify(lecturers, null, 2)}</pre>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-1">Raw Response:</div>
                  <pre className="whitespace-pre-wrap break-words p-2 bg-gray-50 rounded text-xs max-h-40 overflow-y-auto">{JSON.stringify(rawResponse, null, 2)}</pre>
                </div>
              </div>
            </details>
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
