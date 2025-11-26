// components/features/group/CreateEmptyGroupsDialog.tsx
"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { CourseService } from "@/lib/api/courseService"
import { GroupService } from "@/lib/api/groupService"
import type { Course } from "@/lib/types"
import * as XLSX from "xlsx"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { mockUsers } from "@/lib/mock-data/auth"

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (createdCount: number) => void
  initialCourseId?: string
  initialCourseCode?: string
}

export function CreateEmptyGroupsDialog({ isOpen, onClose, onSuccess, initialCourseId, initialCourseCode }: Props) {
  const { toast } = useToast()
  const [courses, setCourses] = React.useState<Course[]>([])
  const [selectedCourseId, setSelectedCourseId] = React.useState<string>("")
  const [selectedCourseCode, setSelectedCourseCode] = React.useState<string>("")
  const [file, setFile] = React.useState<File | null>(null)
  const [parsedNames, setParsedNames] = React.useState<string[]>([])
  const [finalNames, setFinalNames] = React.useState<{ original: string; final: string; duplicate: boolean }[]>([])
  const [parsing, setParsing] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [existingEmptyCount, setExistingEmptyCount] = React.useState<number | null>(null)

  const FormSchema = z.object({
    maxMembers: z.number().min(1, "Tối thiểu 1" ).max(50, "Tối đa 50").default(5),
    lecturerId: z.string().optional().or(z.literal("")),
  })
  type FormValues = z.infer<typeof FormSchema>
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: { maxMembers: 5, lecturerId: "" },
  })

  React.useEffect(() => {
    if (!isOpen) return
    ;(async () => {
      const list = await CourseService.getCourses()
      const activeList = (list || []).filter(c => String(c.status || 'active').toLowerCase() !== 'inactive')
      setCourses(activeList)
      // Ưu tiên giá trị truyền từ ngoài nếu có (và hợp lệ trong danh sách Active)
      if (initialCourseId && activeList.some(c => c.courseId === initialCourseId)) {
        setSelectedCourseId(initialCourseId)
        setSelectedCourseCode(initialCourseCode || (activeList.find(c => c.courseId === initialCourseId)?.courseCode || ""))
      } else if (activeList.length > 0) {
        setSelectedCourseId(activeList[0].courseId)
        setSelectedCourseCode(activeList[0].courseCode)
      } else {
        // Không có khóa học Active
        setSelectedCourseId("")
        setSelectedCourseCode("")
      }
    })()
  }, [isOpen, initialCourseId, initialCourseCode])

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId)
    const c = courses.find(c => c.courseId === courseId)
    setSelectedCourseCode(c?.courseCode || "")
  }

  React.useEffect(() => {
    const loadExistingEmptyCount = async (courseCode: string) => {
      if (!courseCode) return
      try {
        const ts = Date.now()
        const res = await fetch(`/api/proxy/Group/GetGroupByCourseCode/${encodeURIComponent(courseCode)}?_t=${ts}`, {
          cache: 'no-store',
        })
        const groupsRaw = await res.json().catch(() => [])
        const list = Array.isArray(groupsRaw) ? groupsRaw : []
        const emptyCount = list.filter((g: any) => ((g.countMembers ?? 0) === 0) && ((g.groupMembers?.length ?? 0) === 0) && ((g.members?.length ?? 0) === 0)).length
        setExistingEmptyCount(emptyCount)
      } catch {
        setExistingEmptyCount(null)
      }
    }
    if (selectedCourseCode) loadExistingEmptyCount(selectedCourseCode)
  }, [selectedCourseCode])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null
    setFile(f)
    setParsedNames([])
    if (!f) return
    // Kiểm tra phần mở rộng và kích thước
    const ext = f.name.split('.').pop()?.toLowerCase()
    const allowed = ["xlsx", "xls", "csv"]
    if (!ext || !allowed.includes(ext)) {
      toast({ title: "Sai định dạng", description: "Chỉ hỗ trợ .xlsx, .xls, .csv." })
      return
    }
    const maxSize = 5 * 1024 * 1024
    if (f.size > maxSize) {
      toast({ title: "Quá dung lượng", description: "File tối đa 5MB." })
      return
    }

    try {
      setParsing(true)
      const buf = await f.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array' })
      const firstSheetName = wb.SheetNames[0]
      const sheet = wb.Sheets[firstSheetName]
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" }) as any[]
      const names: string[] = rows
        .map(r => String(r.GroupName || r.groupName || "").trim())
        .filter(n => n.length > 0)

      if (names.length === 0) {
        toast({ title: "Sai dữ liệu", description: "Không tìm thấy cột GroupName hoặc dữ liệu rỗng." })
        return
      }

      // Loại bỏ trùng lặp, giữ thứ tự xuất hiện
      const unique: string[] = []
      const seen = new Set<string>()
      for (const n of names) { if (!seen.has(n)) { unique.push(n); seen.add(n); } }
      setParsedNames(unique)
      // Tải tên nhóm hiện có để kiểm tra trùng
      const existingNames = await fetchExistingGroupNames(selectedCourseCode)
      const normalized = uniquifyNames(unique, existingNames)
      setFinalNames(normalized)
      toast({ title: "Đã đọc file", description: `Phát hiện ${unique.length} GroupName. ${normalized.filter(n => n.duplicate).length} trùng lặp sẽ được thêm hậu tố.` })
    } catch (err: any) {
      toast({ title: "Lỗi đọc file", description: err?.message || "Không thể đọc nội dung .xlsx." })
    } finally {
      setParsing(false)
    }
  }

  const fetchExistingGroupNames = async (courseCode: string): Promise<Set<string>> => {
    try {
      if (!courseCode) return new Set<string>()
      const ts = Date.now()
      const res = await fetch(`/api/proxy/Group/GetGroupByCourseCode/${encodeURIComponent(courseCode)}?_t=${ts}`, {
        cache: 'no-store',
      })
      const data = await res.json().catch(() => [])
      const names = new Set<string>((Array.isArray(data) ? data : []).map((g: any) => String(g.name || g.groupName || '').trim()))
      return names
    } catch {
      return new Set<string>()
    }
  }

  const uniquifyNames = (names: string[], existing: Set<string>) => {
    const result: { original: string; final: string; duplicate: boolean }[] = []
    const seen = new Map<string, number>()
    for (const orig of names) {
      let base = orig
      let final = base
      let dup = existing.has(final) || seen.has(final)
      let idx = 1
      while (existing.has(final) || seen.has(final)) {
        final = `${base} (${idx})`
        idx++
        dup = true
      }
      result.push({ original: orig, final, duplicate: dup })
      seen.set(final, 1)
    }
    return result
  }

  const chunked = async <T,>(arr: T[], size = 5) => {
    const chunks: T[][] = []
    for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size))
    return chunks
  }

  const handleSubmit = async () => {
    if (!selectedCourseId || !selectedCourseCode) {
      toast({ title: "Thiếu thông tin", description: "Hãy chọn môn học." })
      return
    }
    if (!file || finalNames.length === 0) {
      toast({ title: "Thiếu file", description: "Hãy chọn file .xlsx có cột GroupName." })
      return
    }
    setSubmitting(true)
    try {
      const vals = form.getValues()
      const namesToCreate = finalNames.map(n => n.final)
      let createdCount = 0
      const parts = await chunked(namesToCreate, 3)
      for (const part of parts) {
        const promises = part.map(async (name) => {
          let created: any = null
          try {
            created = await GroupService.createGroup({ name, courseId: selectedCourseId })
            // Đếm ngay khi tạo thành công, ngay cả khi update sau đó thất bại
            createdCount++
          } catch (err: any) {
            console.warn("Create group failed:", name, err?.message || err)
            return
          }
          // Cố gắng cập nhật thông tin phụ, nhưng không ảnh hưởng đến thống kê đã tạo
          try {
            await GroupService.updateGroup(created.groupId, { name, courseId: selectedCourseId, maxMembers: vals.maxMembers })
          } catch (err: any) {
            console.warn("Update group failed:", name, err?.message || err)
          }
        })
        await Promise.allSettled(promises)
        // Short delay between batches to avoid overwhelming backend
        await new Promise(r => setTimeout(r, 200))
      }
      toast({ title: "Tạo nhóm trống thành công", description: `Đã tạo ${createdCount} nhóm cho môn ${selectedCourseCode}.` })
      onSuccess?.(createdCount)
      onClose()
    } catch (err: any) {
      toast({ title: "Lỗi", description: err?.message || "Không thể tạo nhóm trống." })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo nhóm trống (Import Excel)</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Môn học</Label>
            <Select value={selectedCourseId} onValueChange={handleCourseChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn môn học" />
              </SelectTrigger>
              <SelectContent>
                {courses.map(c => (
                  <SelectItem key={c.courseId} value={c.courseId}>
                    {c.courseCode} - {c.courseName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Chọn file (.xlsx, .xls, .csv)</Label>
              <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
              <p className="text-sm text-gray-600 mt-2">
                {parsing ? "Đang đọc file..." : (finalNames.length > 0 ? `Sẽ tạo ${finalNames.length} nhóm. Trùng lặp sẽ tự thêm hậu tố.` : "Chọn file chứa cột GroupName để tạo nhóm.")}
              </p>
            </div>
            <div>
              <Label>Số lượng thành viên tối đa</Label>
              <Input type="number" min={1} max={50} {...form.register("maxMembers", { valueAsNumber: true })} />
              <p className="text-xs text-gray-500 mt-1">Default: 5</p>
            </div>
          </div>
          <div>
            <Label>Gán Lecturer mặc định (tuỳ chọn)</Label>
            <Select value={(form.watch("lecturerId") || "none") as string} onValueChange={(v) => form.setValue("lecturerId", v === "none" ? "" : v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn Lecturer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Không gán</SelectItem>
                {mockUsers.filter(u => u.role === 'lecturer').map(u => (
                  <SelectItem key={u.userId} value={u.userId}>{u.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">Lưu ý: Group hiện không có field Lecturer. Tuỳ backend, việc gán sẽ qua Course hoặc liên kết khác.</p>
          </div>

          {/* Hiển thị số lượng nhóm trống đã được tạo */}
          <div className="border rounded-md p-3 text-sm text-gray-700">
            Nhóm trống đã được tạo: {existingEmptyCount === null ? "Chưa kiểm tra" : existingEmptyCount}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={submitting || parsing}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={submitting || parsing || !selectedCourseId || finalNames.length === 0}>
            {submitting ? "Đang tạo..." : "Tạo nhóm trống"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
