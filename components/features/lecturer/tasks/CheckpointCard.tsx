"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import type { Checkpoint } from "@/lib/types/task";
import type { Task } from "@/lib/types/task";
import type { Course } from "@/lib/types/course";
import { TaskCard } from "./TaskCard";

interface CheckpointCardProps {
  checkpoint: Checkpoint;
  course: Course | undefined;
  tasks: Task[];
  isExpanded: boolean;
  onToggle: () => void;
  onGradeTask: (task: Task) => void;
  onCreateTask: () => void;
}

export function CheckpointCard({
  checkpoint,
  course,
  tasks,
  isExpanded,
  onToggle,
  onGradeTask,
  onCreateTask,
}: CheckpointCardProps) {
  const gradedTasks = tasks.filter((t) => t.status === "graded");
  const averageGrade =
    gradedTasks.length > 0
      ? Math.round(
          gradedTasks.reduce((sum, t) => sum + (t.grade || 0), 0) /
            gradedTasks.length
        )
      : null;

  return (
    <Card className="overflow-hidden">
      <CardHeader
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
              <CardTitle className="text-xl">
                {checkpoint.checkpointName}
              </CardTitle>
              <Badge variant="outline">
                {checkpoint.weight}% điểm môn học
              </Badge>
            </div>
            <CardDescription className="mt-2 ml-8">
              {course?.courseCode} - {course?.courseName} •{" "}
              {checkpoint.startDate} → {checkpoint.endDate}
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Số task</p>
              <p className="text-lg font-semibold">{tasks.length}</p>
            </div>
            {averageGrade !== null && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Điểm TB</p>
                <p className="text-lg font-semibold text-green-600">
                  {averageGrade}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Chưa có task nào trong checkpoint này</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={onCreateTask}
              >
                <Plus className="w-4 h-4 mr-2" />
                Tạo task cho checkpoint này
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskCard
                  key={task.taskId}
                  task={task}
                  onGradeTask={onGradeTask}
                />
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

