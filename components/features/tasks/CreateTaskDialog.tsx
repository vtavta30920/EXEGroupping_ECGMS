"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { GroupMember, TaskPriority } from "@/lib/types";

type CreateForm = {
  taskName: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  assigneeUserId: string;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  canCreate: boolean;
  members: GroupMember[];
  form: CreateForm;
  setForm: (updater: (prev: CreateForm) => CreateForm) => void;
  onSubmit: () => void;
  loading?: boolean;
};

export default function CreateTaskDialog({ open, onOpenChange, canCreate, members, form, setForm, onSubmit, loading }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={!canCreate}>Tạo task</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tạo task mới</DialogTitle>
        </DialogHeader>
        {!canCreate && (
          <p className="text-sm text-muted-foreground">Bạn cần thuộc một nhóm để tạo task.</p>
        )}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tên task</Label>
            <Input value={form.taskName} onChange={e => setForm(f => ({ ...f, taskName: e.target.value }))} placeholder="VD: Thiết kế giao diện" />
          </div>
          <div className="space-y-2">
            <Label>Mô tả</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hạn hoàn thành</Label>
              <Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Ưu tiên</Label>
              <Select value={form.priority} onValueChange={(v) => setForm(f => ({ ...f, priority: v as TaskPriority }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Thấp</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="high">Cao</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Giao cho</Label>
            <Select value={form.assigneeUserId} onValueChange={(v) => setForm(f => ({ ...f, assigneeUserId: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn thành viên" />
              </SelectTrigger>
              <SelectContent>
                {members.map(m => (
                  <SelectItem key={m.userId} value={m.userId}>{m.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(!members || members.length === 0) && (
              <p className="text-xs text-muted-foreground">Không có thành viên để giao. Kiểm tra nhóm của bạn.</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
            <Button onClick={onSubmit} disabled={loading || !form.taskName.trim() || !form.assigneeUserId}>Tạo</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}