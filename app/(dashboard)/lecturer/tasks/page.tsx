"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/utils/auth";
import { mockTasks } from "@/lib/mock-data/tasks";
import { mockCheckpoints } from "@/lib/mock-data/checkpoints";
import { mockCourses } from "@/lib/mock-data/courses";
import { mockGroups } from "@/lib/mock-data/groups";
import { useToast } from "@/lib/hooks/use-toast";
import type {
  Task,
  Checkpoint,
  Course,
  Group,
  CreateTaskForm,
  TaskGradeForm,
} from "@/lib/types";
import {
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Award,
  Calendar,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function TasksPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showGradeDialog, setShowGradeDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [expandedCheckpoints, setExpandedCheckpoints] = useState<Set<string>>(
    new Set()
  );
  const { toast } = useToast();

  // Form state
  const [taskForm, setTaskForm] = useState<CreateTaskForm>({
    taskName: "",
    description: "",
    courseId: "",
    checkpointId: "",
    groupIds: [],
    priority: "medium",
    dueDate: "",
    maxScore: 100,
  });

  const [gradeForm, setGradeForm] = useState<TaskGradeForm>({
    taskId: "",
    score: 0,
    feedback: "",
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== "lecturer") {
      router.push("/login");
      return;
    }
    setUser(currentUser);
  }, [router]);

  if (!user) return null;

  // Filter data for the signed-in lecturer
  const lecturerCourses = mockCourses.filter(
    (c) => c.lecturerId === user.userId
  );
  const lecturerCourseIds = new Set(lecturerCourses.map((c) => c.courseId));
  const lecturerGroups = mockGroups.filter((g) =>
    lecturerCourseIds.has(g.courseId)
  );
  const lecturerCheckpoints = mockCheckpoints.filter((cp) =>
    lecturerCourseIds.has(cp.courseId)
  );

  // Get tasks for lecturer's groups
  const lecturerGroupIds = new Set(lecturerGroups.map((g) => g.groupId));
  const lecturerTasks = mockTasks.filter((t) =>
    lecturerGroupIds.has(t.groupId)
  );

  // Group tasks by checkpoint
  const tasksByCheckpoint = lecturerCheckpoints.reduce((acc, checkpoint) => {
    const tasks = lecturerTasks.filter(
      (t) => t.checkpointId === checkpoint.checkpointId
    );
    if (tasks.length > 0 || true) {
      // Show all checkpoints even if no tasks
      acc[checkpoint.checkpointId] = {
        checkpoint,
        tasks,
      };
    }
    return acc;
  }, {} as Record<string, { checkpoint: Checkpoint; tasks: Task[] }>);

  const toggleCheckpoint = (checkpointId: string) => {
    const newExpanded = new Set(expandedCheckpoints);
    if (newExpanded.has(checkpointId)) {
      newExpanded.delete(checkpointId);
    } else {
      newExpanded.add(checkpointId);
    }
    setExpandedCheckpoints(newExpanded);
  };

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

  const handleCreateTask = () => {
    if (
      !taskForm.taskName ||
      !taskForm.courseId ||
      !taskForm.checkpointId ||
      taskForm.groupIds.length === 0 ||
      !taskForm.dueDate
    ) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    // TODO: Call API to create task
    toast({
      title: "Thành công",
      description: `Đã tạo task "${taskForm.taskName}" cho ${taskForm.groupIds.length} nhóm`,
    });

    // Reset form
    setTaskForm({
      taskName: "",
      description: "",
      courseId: "",
      checkpointId: "",
      groupIds: [],
      priority: "medium",
      dueDate: "",
      maxScore: 100,
    });
    setShowCreateDialog(false);
  };

  const handleGradeTask = (task: Task) => {
    setSelectedTask(task);
    setGradeForm({
      taskId: task.taskId,
      score: task.grade || 0,
      feedback: task.feedback || "",
    });
    setShowGradeDialog(true);
  };

  const handleSubmitGrade = () => {
    if (
      !selectedTask ||
      gradeForm.score < 0 ||
      gradeForm.score > (selectedTask.maxScore || 100)
    ) {
      toast({
        title: "Lỗi",
        description: "Điểm số không hợp lệ",
        variant: "destructive",
      });
      return;
    }

    // TODO: Call API to submit grade
    toast({
      title: "Thành công",
      description: `Đã chấm điểm ${gradeForm.score}/${
        selectedTask.maxScore || 100
      } cho task "${selectedTask.taskName}"`,
    });

    setShowGradeDialog(false);
    setSelectedTask(null);
  };

  const handleGroupToggle = (groupId: string) => {
    const newGroupIds = [...taskForm.groupIds];
    const index = newGroupIds.indexOf(groupId);
    if (index > -1) {
      newGroupIds.splice(index, 1);
    } else {
      newGroupIds.push(groupId);
    }
    setTaskForm({ ...taskForm, groupIds: newGroupIds });
  };

  // Get groups for selected course
  const availableGroups = taskForm.courseId
    ? lecturerGroups.filter((g) => g.courseId === taskForm.courseId)
    : [];

  // Get checkpoints for selected course
  const availableCheckpoints = taskForm.courseId
    ? lecturerCheckpoints.filter((cp) => cp.courseId === taskForm.courseId)
    : [];

  return (
    <DashboardLayout role="lecturer">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý Task và Chấm điểm
            </h1>
            <p className="text-gray-600 mt-1">
              Tạo task, phân công cho nhóm và chấm điểm theo Checkpoint
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Plus className="w-4 h-4 mr-2" />
                Tạo Task mới
              </Button>
            </DialogTrigger>
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
                      setTaskForm({ ...taskForm, taskName: e.target.value })
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
                      setTaskForm({ ...taskForm, description: e.target.value })
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
                        setTaskForm({
                          ...taskForm,
                          courseId: value,
                          checkpointId: "", // Reset checkpoint when course changes
                          groupIds: [], // Reset groups when course changes
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn môn học" />
                      </SelectTrigger>
                      <SelectContent>
                        {lecturerCourses.map((course) => (
                          <SelectItem
                            key={course.courseId}
                            value={course.courseId}
                          >
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
                        setTaskForm({ ...taskForm, checkpointId: value })
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
                              checked={taskForm.groupIds.includes(
                                group.groupId
                              )}
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
                        setTaskForm({ ...taskForm, priority: value })
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
                        setTaskForm({ ...taskForm, dueDate: e.target.value })
                      }
                    />
                  </div>
                  {/* <div className="space-y-2">
                    <Label htmlFor="maxScore">Điểm tối đa</Label>
                    <Input
                      id="maxScore"
                      type="number"
                      value={taskForm.maxScore}
                      onChange={(e) =>
                        setTaskForm({
                          ...taskForm,
                          maxScore: parseInt(e.target.value) || 100,
                        })
                      }
                      min={1}
                      max={100}
                    />
                  </div> */}
                  <div className="flex items-center">
                    <button
                      className="text-sm text-blue-600 hover:underline"
                      onClick={() =>
                        toast({
                          title: "Xem chi tiết",
                          description: task.taskName,
                        })
                      }
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Hủy
                </Button>
                <Button onClick={handleCreateTask}>Tạo Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tasks organized by Checkpoint */}
        <div className="space-y-4">
          {Object.entries(tasksByCheckpoint)
            .sort(
              ([, a], [, b]) =>
                a.checkpoint.checkpointNumber - b.checkpoint.checkpointNumber
            )
            .map(([checkpointId, { checkpoint, tasks }]) => {
              const isExpanded = expandedCheckpoints.has(checkpointId);
              const course = lecturerCourses.find(
                (c) => c.courseId === checkpoint.courseId
              );

              // Calculate checkpoint statistics
              const gradedTasks = tasks.filter((t) => t.status === "graded");
              const submittedTasks = tasks.filter(
                (t) => t.status === "submitted"
              );
              const averageGrade =
                gradedTasks.length > 0
                  ? Math.round(
                      gradedTasks.reduce((sum, t) => sum + (t.grade || 0), 0) /
                        gradedTasks.length
                    )
                  : null;

              return (
                <Card key={checkpointId} className="overflow-hidden">
                  <CardHeader
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleCheckpoint(checkpointId)}
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
                          <p className="text-lg font-semibold">
                            {tasks.length}
                          </p>
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
                            onClick={() => {
                              setTaskForm({
                                ...taskForm,
                                courseId: checkpoint.courseId,
                                checkpointId: checkpoint.checkpointId,
                              });
                              setShowCreateDialog(true);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Tạo task cho checkpoint này
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {tasks.map((task) => (
                            <Card
                              key={task.taskId}
                              className="border-l-4 border-l-orange-500"
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      {getStatusIcon(task.status)}
                                      <h4 className="font-semibold text-lg">
                                        {task.taskName}
                                      </h4>
                                      <Badge
                                        className={getPriorityColor(
                                          task.priority
                                        )}
                                      >
                                        {getPriorityLabel(task.priority)}
                                      </Badge>
                                      <Badge
                                        className={getStatusColor(task.status)}
                                      >
                                        {getStatusLabel(task.status)}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">
                                      {task.description}
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                      <div>
                                        <p className="text-gray-600">Nhóm</p>
                                        <p className="font-semibold">
                                          {task.groupName}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">
                                          Deadline
                                        </p>
                                        <p className="font-semibold flex items-center gap-1">
                                          <Calendar className="w-4 h-4" />
                                          {task.dueDate}
                                        </p>
                                      </div>
                                      {task.status === "graded" &&
                                        task.grade !== undefined && (
                                          <div>
                                            <p className="text-gray-600">
                                              Điểm
                                            </p>
                                            <p className="font-semibold text-green-600">
                                              {task.grade}/
                                              {task.maxScore || 100}
                                            </p>
                                          </div>
                                        )}
                                      {task.status === "submitted" && (
                                        <div>
                                          <p className="text-gray-600">
                                            Đã nộp
                                          </p>
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
                                        <p className="text-sm text-gray-600">
                                          {task.feedback}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col gap-2 ml-4">
                                    {task.status === "submitted" && (
                                      <Button
                                        size="sm"
                                        onClick={() => handleGradeTask(task)}
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
                                        onClick={() => handleGradeTask(task)}
                                      >
                                        <Award className="w-4 h-4 mr-2" />
                                        Xem/Sửa điểm
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
        </div>

        {/* Grade Dialog */}
        <Dialog open={showGradeDialog} onOpenChange={setShowGradeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chấm điểm Task</DialogTitle>
              <DialogDescription>
                {selectedTask && `Chấm điểm cho task: ${selectedTask.taskName}`}
              </DialogDescription>
            </DialogHeader>
            {selectedTask && (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Nhóm:</p>
                  <p className="font-semibold">{selectedTask.groupName}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="score">
                    Điểm số (0 - {selectedTask.maxScore || 100}) *
                  </Label>
                  <Input
                    id="score"
                    type="number"
                    value={gradeForm.score}
                    onChange={(e) =>
                      setGradeForm({
                        ...gradeForm,
                        score: parseInt(e.target.value) || 0,
                      })
                    }
                    min={0}
                    max={selectedTask.maxScore || 100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feedback">Nhận xét</Label>
                  <Textarea
                    id="feedback"
                    value={gradeForm.feedback}
                    onChange={(e) =>
                      setGradeForm({ ...gradeForm, feedback: e.target.value })
                    }
                    placeholder="Nhập nhận xét cho nhóm..."
                    rows={4}
                  />
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
                    💡 Điểm này sẽ được áp dụng cho tất cả thành viên trong nhóm
                    {selectedTask.groupName}
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowGradeDialog(false)}
              >
                Hủy
              </Button>
              <Button onClick={handleSubmitGrade}>Lưu điểm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
