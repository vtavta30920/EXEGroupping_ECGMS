"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Task } from "@/lib/types";
import { ArrowRightLeft, CheckCircle2, Clock, ListTodo } from "lucide-react";

type Props = {
  tasks: Task[];
  onOpenTask: (task: Task) => void;
  onMoveStatus: (task: Task, nextStatus: Task["status"]) => void;
};

function Column({ title, tasks, moveNext, movePrev, onOpenTask }: { title: string; tasks: Task[]; moveNext?: (t: Task) => void; movePrev?: (t: Task) => void; onOpenTask: (t: Task) => void; }) {
  return (
    <div className="bg-muted/30 rounded-lg p-3 space-y-3 min-h-[200px]">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <Badge variant="outline">{tasks.length}</Badge>
      </div>
      {tasks.map(t => (
        <Card key={t.taskId} className="hover:shadow-sm transition-shadow">
          <CardHeader>
            <CardTitle className="text-base cursor-pointer" onClick={() => onOpenTask(t)}>{t.taskName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground line-clamp-2">{t.description || "Không có mô tả"}</p>
            <div className="flex items-center justify-between text-xs">
              <span>Ưu tiên: {t.priority}</span>
              <span>Hạn: {new Date(t.dueDate).toISOString().slice(0, 10)}</span>
            </div>
            <div className="flex gap-2 justify-end">
              {movePrev && (
                <Button size="sm" variant="outline" onClick={() => movePrev(t)} title="Chuyển về trước">
                  <ArrowRightLeft className="w-4 h-4 rotate-180" />
                </Button>
              )}
              {moveNext && (
                <Button size="sm" onClick={() => moveNext(t)} title="Chuyển tới tiếp theo">
                  <ArrowRightLeft className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      {tasks.length === 0 && (
        <div className="text-center text-sm text-muted-foreground py-8">Chưa có task</div>
      )}
    </div>
  );
}

export default function TaskKanban({ tasks, onOpenTask, onMoveStatus }: Props) {
  const pending = tasks.filter(t => t.status === "pending");
  const inProgress = tasks.filter(t => t.status === "in-progress");
  const graded = tasks.filter(t => t.status === "graded");

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Column
        title="Pending"
        tasks={pending}
        moveNext={(t) => onMoveStatus(t, "in-progress")}
        onOpenTask={onOpenTask}
      />
      <Column
        title="In Progress"
        tasks={inProgress}
        movePrev={(t) => onMoveStatus(t, "pending")}
        moveNext={(t) => onMoveStatus(t, "graded")}
        onOpenTask={onOpenTask}
      />
      <Column
        title="Graded"
        tasks={graded}
        movePrev={(t) => onMoveStatus(t, "in-progress")}
        onOpenTask={onOpenTask}
      />
    </div>
  );
}
