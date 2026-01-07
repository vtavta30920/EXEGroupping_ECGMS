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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateTaskForm } from "@/lib/types/task";
import type { Course } from "@/lib/types/course";
import type { Checkpoint } from "@/lib/types/task";
import type { Group } from "@/lib/types/group";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskForm: CreateTaskForm;
  onFormChange: (form: CreateTaskForm) => void;
  onSubmit: () => void;
  courses: Course[];
  checkpoints: Checkpoint[];
  groups: Group[];
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  taskForm,
  onFormChange,
  onSubmit,
  courses,
  checkpoints,
  groups,
}: CreateTaskDialogProps) {
  const availableGroups = taskForm.courseId
    ? groups.filter((g) => g.courseId === taskForm.courseId)
    : [];
  const availableCheckpoints = taskForm.courseId
    ? checkpoints.filter((cp) => cp.courseId === taskForm.courseId)
    : [];

  const handleGroupToggle = (groupId: string) => {
    const newGroupIds = [...taskForm.groupIds];
    const index = newGroupIds.indexOf(groupId);
    if (index > -1) {
      newGroupIds.splice(index, 1);
    } else {
      newGroupIds.push(groupId);
    }
    onFormChange({ ...taskForm, groupIds: newGroupIds });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo Task mới</DialogTitle>
          <DialogDescription>
            Tạo task và phân công cho các nhóm sinh viên
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="taskName">Tên Task *</Label>
            <Input
              id="taskName"
              value={taskForm.taskName}
              onChange={(e) =>
                onFormChange({ ...taskForm, taskName: e.target.value })
              }
              placeholder="Nhập tên task"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Nội dung yêu cầu</Label>
            <Textarea
              id="description"
              value={taskForm.description}
              onChange={(e) =>
                onFormChange({ ...taskForm, description: e.target.value })
              }
              placeholder="Mô tả chi tiết yêu cầu của task"
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="courseId">Môn học *</Label>
              <Select
                value={taskForm.courseId}
                onValueChange={(value) =>
                  onFormChange({
                    ...taskForm,
                    courseId: value,
                    checkpointId: "",
                    groupIds: [],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn môn học" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.courseId} value={course.courseId}>
                      {course.courseCode} - {course.courseName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkpointId">Checkpoint *</Label>
              <Select
                value={taskForm.checkpointId}
                onValueChange={(value) =>
                  onFormChange({ ...taskForm, checkpointId: value })
                }
                disabled={!taskForm.courseId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn checkpoint" />
                </SelectTrigger>
                <SelectContent>
                  {availableCheckpoints.map((checkpoint) => (
                    <SelectItem
                      key={checkpoint.checkpointId}
                      value={checkpoint.checkpointId}
                    >
                      {checkpoint.checkpointName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Phân công cho nhóm *</Label>
            <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
              {availableGroups.length === 0 ? (
                <p className="text-sm text-gray-500">
                  {taskForm.courseId
                    ? "Không có nhóm nào trong môn học này"
                    : "Vui lòng chọn môn học trước"}
                </p>
              ) : (
                <div className="space-y-2">
                  {availableGroups.map((group) => (
                    <div
                      key={group.groupId}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        id={group.groupId}
                        checked={taskForm.groupIds.includes(group.groupId)}
                        onChange={() => handleGroupToggle(group.groupId)}
                        className="w-4 h-4"
                      />
                      <label
                        htmlFor={group.groupId}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {group.groupName} ({group.memberCount} thành viên)
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Độ ưu tiên *</Label>
              <Select
                value={taskForm.priority}
                onValueChange={(value: "low" | "medium" | "high") =>
                  onFormChange({ ...taskForm, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Cao</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="low">Thấp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Deadline *</Label>
              <Input
                id="dueDate"
                type="date"
                value={taskForm.dueDate}
                onChange={(e) =>
                  onFormChange({ ...taskForm, dueDate: e.target.value })
                }
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={onSubmit}>Tạo Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

