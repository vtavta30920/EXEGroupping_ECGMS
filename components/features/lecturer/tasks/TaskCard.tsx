"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Award,
  Calendar,
  AlertCircle,
  FileText,
  Clock,
} from "lucide-react";
import type { Task } from "@/lib/types/task";

interface TaskCardProps {
  task: Task;
  onGradeTask: (task: Task) => void;
}

export function TaskCard({ task, onGradeTask }: TaskCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "graded":
        return <Award className="w-5 h-5 text-green-600" />;
      case "submitted":
        return <FileText className="w-5 h-5 text-blue-600" />;
      case "in-progress":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "pending":
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "graded":
        return "bg-green-100 text-green-700";
      case "submitted":
        return "bg-blue-100 text-blue-700";
      case "in-progress":
        return "bg-yellow-100 text-yellow-700";
      case "pending":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "graded":
        return "Đã chấm";
      case "submitted":
        return "Đã nộp";
      case "in-progress":
        return "Đang làm";
      case "pending":
        return "Chưa bắt đầu";
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-orange-100 text-orange-700";
      case "low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Cao";
      case "medium":
        return "Trung bình";
      case "low":
        return "Thấp";
      default:
        return priority;
    }
  };

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {getStatusIcon(task.status)}
              <h4 className="font-semibold text-lg">{task.taskName}</h4>
              <Badge className={getPriorityColor(task.priority)}>
                {getPriorityLabel(task.priority)}
              </Badge>
              <Badge className={getStatusColor(task.status)}>
                {getStatusLabel(task.status)}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-3">{task.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Nhóm</p>
                <p className="font-semibold">{task.groupName}</p>
              </div>
              <div>
                <p className="text-gray-600">Deadline</p>
                <p className="font-semibold flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {task.dueDate}
                </p>
              </div>
              {task.status === "graded" && task.grade !== undefined && (
                <div>
                  <p className="text-gray-600">Điểm</p>
                  <p className="font-semibold text-green-600">
                    {task.grade}/{task.maxScore || 100}
                  </p>
                </div>
              )}
              {task.status === "submitted" && (
                <div>
                  <p className="text-gray-600">Đã nộp</p>
                  <p className="font-semibold text-blue-600">
                    {task.submittedDate}
                  </p>
                </div>
              )}
            </div>
            {task.feedback && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Nhận xét:
                </p>
                <p className="text-sm text-gray-600">{task.feedback}</p>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 ml-4">
            {task.status === "submitted" && (
              <Button
                size="sm"
                onClick={() => onGradeTask(task)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Award className="w-4 h-4 mr-2" />
                Chấm điểm
              </Button>
            )}
            {task.status === "graded" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onGradeTask(task)}
              >
                <Award className="w-4 h-4 mr-2" />
                Xem/Sửa điểm
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

