"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Task } from "@/lib/types";

type Props = {
  tasks: Task[];
  currentUserId?: string;
};

function countDueSoon(tasks: Task[], days = 3) {
  const now = new Date();
  const limit = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return tasks.filter(t => {
    const due = new Date(t.dueDate);
    return due >= now && due <= limit && t.status !== "completed";
  }).length;
}

export function TaskStats({ tasks, currentUserId }: Props) {
  const myTasks = tasks.filter(t => t.assignedToId === currentUserId);
  const inProgress = tasks.filter(t => t.status === "in-progress").length;
  const dueSoon = countDueSoon(tasks, 3);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Task của tôi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{myTasks.length}</div>
          <p className="text-sm text-muted-foreground">Được giao cho bạn</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Đang thực hiện</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{inProgress}</div>
          <p className="text-sm text-muted-foreground">Trong tiến trình</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Sắp đến hạn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{dueSoon}</div>
          <p className="text-sm text-muted-foreground">Trong 3 ngày tới</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default TaskStats;