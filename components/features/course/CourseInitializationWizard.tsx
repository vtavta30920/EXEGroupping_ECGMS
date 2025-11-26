// components/features/course/CourseInitializationWizard.tsx
"use client"

import * as React from "react"
import { CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Course } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"

interface WizardProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (newCourses: Course[]) => void
  existingCourses: Course[]
}

export function CourseInitializationWizard({ isOpen, onClose, onComplete, existingCourses }: WizardProps) {
  const [courseCode, setCourseCode] = React.useState("");
  const [courseName, setCourseName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string>("");
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!courseCode || !courseName) {
      setErrorMessage("Vui lòng nhập đầy đủ Mã lớp và Tên lớp.");
      toast({ variant: 'destructive', title: 'Thiếu thông tin', description: 'Vui lòng nhập đầy đủ Mã lớp và Tên lớp.' });
      return;
    }

    // --- Validation: chặn trùng mã khi course đang Active ---
    const enteredCode = courseCode.trim().toLowerCase();
    const duplicate = existingCourses?.find(c => (c.courseCode || '').toLowerCase() === enteredCode);
    if (duplicate) {
      const raw = (duplicate as any).status;
      const s = typeof raw === 'string' ? raw.toLowerCase() : raw;
      const isActive = s === 1 || s === '1' || s === 'active' || s === 'open';
      if (isActive) {
        setErrorMessage(`Mã khóa học này đang hoạt động. Vui lòng deactivate khóa học cũ trước khi tạo mới.`);
        toast({ variant: 'destructive', title: 'Mã đang hoạt động', description: `Mã "${courseCode}" thuộc về một khóa học Active.` });
        return;
      } else {
        toast({ title: 'Mã trùng với khóa học ẩn', description: 'Hệ thống sẽ tạo phiên bản mới.' });
      }
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/courses/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ courseCode, courseName, description })
      });

      if (!res.ok) {
        let message = 'Khởi tạo thất bại';
        try {
          const text = await res.text();
          message = text || message;
          try {
            const parsed = JSON.parse(text);
            if (parsed?.error) message = parsed.error;
          } catch {}
        } catch {}
        throw new Error(message);
      }

      const created = await res.json();
      toast({ title: 'Thành công', description: 'Khởi tạo khóa học thành công!' });
      const mapped = {
        courseId: created?.id || created?.courseId || `${courseCode}`,
        courseCode: created?.courseCode ?? courseCode,
        courseName: created?.courseName ?? courseName,
        description: created?.description ?? description,
        semester: "N/A",
        year: new Date().getFullYear(),
        status: "Active",
        createdDate: created?.createdAt ?? new Date().toISOString(),
        lecturerId: "",
        groupCount: 0,
        studentCount: 0,
      } as import("@/lib/types").Course;
      onComplete([mapped]);
      setErrorMessage("");
      onClose();
    } catch (err: any) {
      console.error('CreateCourseByAdmin error:', err);
      const msgRaw = String(err?.message || '');
      const msgLower = msgRaw.toLowerCase();
      let displayMsg = msgRaw;
      if (msgLower.includes('mã khóa học đã tồn tại')) {
        displayMsg = 'Mã khóa học đã tồn tại.';
      } else if (msgLower.includes('unauthorized')) {
        displayMsg = 'Bạn cần đăng nhập với quyền admin để khởi tạo khóa học.';
      } else if (!displayMsg) {
        displayMsg = 'Có lỗi xảy ra khi khởi tạo. Vui lòng thử lại.';
      }
      setErrorMessage(displayMsg);
      toast({ variant: 'destructive', title: 'Lỗi', description: displayMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Khởi tạo Kỳ học mới</DialogTitle>
          <DialogDescription>
            Tạo khóa học theo API CreateCourseByAdmin.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="courseCode">Course Code</Label>
            <Input id="courseCode" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} placeholder="e.g., EXE101_Summer2025_C1" />
          </div>
          <div>
            <Label htmlFor="courseName">Course Name</Label>
            <Input id="courseName" value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="e.g., EXE101 Summer 2025 - Class 1" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
          </div>
          {errorMessage && (
            <p className="text-sm text-red-600" role="alert">{errorMessage}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>Đang tạo... <Loader2 className="w-4 h-4 ml-2 animate-spin" /></>
            ) : (
              <>Tạo khóa học <CheckCircle className="w-4 h-4 ml-2" /></>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}