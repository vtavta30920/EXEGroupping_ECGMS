"use client";

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
import type { Task } from "@/lib/types/task";
import type { TaskGradeForm } from "@/lib/types/task";

interface GradeTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  gradeForm: TaskGradeForm;
  onFormChange: (form: TaskGradeForm) => void;
  onSubmit: () => void;
}

export function GradeTaskDialog({
  open,
  onOpenChange,
  task,
  gradeForm,
  onFormChange,
  onSubmit,
}: GradeTaskDialogProps) {
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chấm điểm Task</DialogTitle>
          <DialogDescription>
            Chấm điểm cho task: {task.taskName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Nhóm:</p>
            <p className="font-semibold">{task.groupName}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="score">
              Điểm số (0 - {task.maxScore || 100}) *
            </Label>
            <Input
              id="score"
              type="number"
              value={gradeForm.score}
              onChange={(e) =>
                onFormChange({
                  ...gradeForm,
                  score: parseInt(e.target.value) || 0,
                })
              }
              min={0}
              max={task.maxScore || 100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="feedback">Nhận xét</Label>
            <Textarea
              id="feedback"
              value={gradeForm.feedback}
              onChange={(e) =>
                onFormChange({ ...gradeForm, feedback: e.target.value })
              }
              placeholder="Nhập nhận xét cho nhóm..."
              rows={4}
            />
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              💡 Điểm này sẽ được áp dụng cho tất cả thành viên trong nhóm{" "}
              {task.groupName}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={onSubmit}>Lưu điểm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

