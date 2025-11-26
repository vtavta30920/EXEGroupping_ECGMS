"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { GroupMember, Task } from "@/lib/types";
import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  task: Task | null;
  members: GroupMember[];
  onUpdate: (payload: { status: Task["status"]; progressPercent: number; remarks: string }) => void;
};

export default function TaskDetailSheet({ open, onOpenChange, task, members, onUpdate }: Props) {
  const [status, setStatus] = useState<Task["status"]>("pending");
  const [progress, setProgress] = useState<number>(0);
  const [remarks, setRemarks] = useState<string>("");
  const [commentText, setCommentText] = useState<string>("");
  const [comments, setComments] = useState<string[]>([]);

  useEffect(() => {
    if (task) {
      setStatus(task.status);
      setProgress(task.status === "graded" ? 100 : task.status === "in-progress" ? 50 : 10);
      setRemarks("");
      setComments([]);
      setCommentText("");
    }
  }, [task]);

  const addComment = () => {
    if (!commentText.trim()) return;
    setComments(prev => [commentText.trim(), ...prev]);
    setCommentText("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-xl">
        {task && (
          <>
            <SheetHeader>
              <SheetTitle>{task.taskName}</SheetTitle>
              <SheetDescription>{task.description || "Không có mô tả"}</SheetDescription>
            </SheetHeader>
            <div className="px-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Trạng thái</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as Task["status"]) }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Chờ làm</SelectItem>
                      <SelectItem value="in-progress">Đang làm</SelectItem>
                    <SelectItem value="graded">Hoàn thành</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tiến độ (%)</Label>
                  <input type="range" min={0} max={100} value={progress} onChange={(e) => setProgress(Number(e.target.value))} />
                  <div className="text-xs text-muted-foreground">{progress}%</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Ghi chú</Label>
                <Textarea rows={3} value={remarks} onChange={e => setRemarks(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Assignee</Label>
                <Input readOnly value={task.assignedTo ? `${task.assignedTo}` : "Chưa gán"} />
                {/* Optional reassign dropdown can be added later */}
              </div>

              <div className="space-y-2">
                <Label>Bình luận</Label>
                <div className="flex gap-2">
                  <Input placeholder="Nhập bình luận" value={commentText} onChange={e => setCommentText(e.target.value)} />
                  <Button onClick={addComment}>Gửi</Button>
                </div>
                <div className="space-y-2 max-h-40 overflow-auto border rounded p-2">
                  {comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Chưa có bình luận</p>
                  ) : (
                    comments.map((c, idx) => (
                      <div key={idx} className="text-sm">• {c}</div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <SheetFooter>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
                <Button onClick={() => onUpdate({ status, progressPercent: progress, remarks })}>Lưu cập nhật</Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
