"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Course } from "@/lib/types";

interface CourseFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: Course) => void;
  course: Course | null;
}

export function CourseFormDialog({
  isOpen,
  onClose,
  onSave,
  course,
}: CourseFormDialogProps) {
  const [formData, setFormData] = React.useState<Partial<Course>>({});

  React.useEffect(() => {
    if (course) {
      setFormData(course);
    } else {
      setFormData({
        courseCode: "",
        courseName: "",
        semester: "",
        year: new Date().getFullYear(),
        description: "",
        lecturerId: "L001", // Default lecturer ID
      });
    }
  }, [course, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    // Basic validation
    if (
      !formData.courseCode ||
      !formData.courseName ||
      !formData.semester ||
      !formData.year
    ) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }
    onSave(formData as Course);
    onClose();
  };

  const isEditing = course !== null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Chỉnh sửa Khóa học" : "Tạo Khóa học Mới"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Cập nhật thông tin cho khóa học này."
              : "Điền thông tin chi tiết để tạo một khóa học mới."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="courseCode" className="text-right">
              Mã môn
            </Label>
            <Input
              id="courseCode"
              value={formData.courseCode || ""}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="courseName" className="text-right">
              Tên môn
            </Label>
            <Input
              id="courseName"
              value={formData.courseName || ""}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">
              Mô tả
            </Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit}>
            {isEditing ? "Lưu thay đổi" : "Tạo khóa học"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
