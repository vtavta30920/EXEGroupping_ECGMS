"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/utils/auth";
import { mockTasks } from "@/lib/mock-data/tasks";
import { mockCheckpoints } from "@/lib/mock-data/checkpoints";
import { mockCourses } from "@/lib/mock-data/courses";
import { mockGroups } from "@/lib/mock-data/groups";
import { useToast } from "@/lib/hooks/use-toast";
import type { Task } from "@/lib/types/task";
import type { Checkpoint } from "@/lib/types/task";
import type { Course } from "@/lib/types/course";
import type { Group } from "@/lib/types/group";
import type { CreateTaskForm } from "@/lib/types/task";
import type { TaskGradeForm } from "@/lib/types/task";
import { Plus } from "lucide-react";
import { CreateTaskDialog } from "@/components/features/lecturer/tasks/CreateTaskDialog";
import { GradeTaskDialog } from "@/components/features/lecturer/tasks/GradeTaskDialog";
import { CheckpointCard } from "@/components/features/lecturer/tasks/CheckpointCard";

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
          <div>
            <Button
              className="bg-orange-500 hover:bg-orange-600"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Tạo Task mới
            </Button>
            <CreateTaskDialog
              open={showCreateDialog}
              onOpenChange={setShowCreateDialog}
              taskForm={taskForm}
              onFormChange={setTaskForm}
              onSubmit={handleCreateTask}
              courses={lecturerCourses}
              checkpoints={lecturerCheckpoints}
              groups={lecturerGroups}
            />
          </div>
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

              return (
                <CheckpointCard
                  key={checkpointId}
                  checkpoint={checkpoint}
                  course={course}
                  tasks={tasks}
                  isExpanded={isExpanded}
                  onToggle={() => toggleCheckpoint(checkpointId)}
                  onGradeTask={handleGradeTask}
                  onCreateTask={() => {
                    setTaskForm({
                      ...taskForm,
                      courseId: checkpoint.courseId,
                      checkpointId: checkpoint.checkpointId,
                    });
                    setShowCreateDialog(true);
                  }}
                />
              );
            })}
        </div>

        <GradeTaskDialog
          open={showGradeDialog}
          onOpenChange={setShowGradeDialog}
          task={selectedTask}
          gradeForm={gradeForm}
          onFormChange={setGradeForm}
          onSubmit={handleSubmitGrade}
        />
      </div>
    </DashboardLayout>
  );
}
