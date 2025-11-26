"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import type { Task, TaskPriority, TaskStatus } from "@/lib/types";

type Props = {
  tasks: Task[];
  onOpenTask: (task: Task) => void;
  onUpdateProgress?: (task: Task) => void;
};

const getStatusIcon = (status: TaskStatus) => {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    case "in-progress":
      return <Clock className="w-5 h-5 text-blue-600" />;
    case "pending":
    default:
      return <AlertCircle className="w-5 h-5 text-orange-600" />;
  }
};

const progressFromStatus = (status: TaskStatus) => {
  if (status === "completed") return 100;
  if (status === "in-progress") return 50;
  return 10;
};

export default function TaskList({ tasks, onOpenTask, onUpdateProgress }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tasks.map(t => (
        <Card key={t.taskId} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  {getStatusIcon(t.status)}
                  <CardTitle className="text-lg cursor-pointer" onClick={() => onOpenTask(t)}>
                    {t.taskName}
                  </CardTitle>
                </div>
                {t.groupName && (
                  <p className="text-sm text-gray-600 mt-2">Từ nhóm: {t.groupName}</p>
                )}
              </div>
              <Badge variant={t.priority === "high" ? "destructive" : "secondary"}>
                Ưu tiên: {t.priority as TaskPriority}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{t.description || "Không có mô tả"}</p>
            <div className="text-sm grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium">Trạng thái:</span> {t.status}
              </div>
              <div>
                <span className="font-medium">Hạn:</span> {new Date(t.dueDate).toISOString().slice(0, 10)}
              </div>
            </div>
            <Progress value={progressFromStatus(t.status)} />
            <div className="flex justify-end gap-2">
              {onUpdateProgress && (
                <Button variant="outline" onClick={() => onUpdateProgress(t)}>Cập nhật tiến độ</Button>
              )}
              <Button onClick={() => onOpenTask(t)}>Chi tiết</Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {tasks.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">Không có task phù hợp.</CardContent>
        </Card>
      )}
    </div>
  );
}