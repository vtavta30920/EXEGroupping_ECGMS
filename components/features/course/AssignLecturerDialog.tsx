"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus, Trash2, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

interface Lecturer {
  id: string;
  fullName: string;
  email?: string;
  username?: string;
}

interface LecturerCourse {
  id: string;
  lecturerId: string;
  courseId: string;
  lecturer?: Lecturer;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseName: string;
}

export function AssignLecturerDialog({ isOpen, onClose, courseId, courseName }: Props) {
  const { toast } = useToast();
  const [lecturers, setLecturers] = React.useState<Lecturer[]>([]);
  const [assignedLecturers, setAssignedLecturers] = React.useState<LecturerCourse[]>([]);
  const [selectedLecturerId, setSelectedLecturerId] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isAssigning, setIsAssigning] = React.useState(false);

  // Fetch all lecturers
  const fetchLecturers = React.useCallback(async () => {
    try {
      const res = await fetch("/api/proxy/User/Lecturer?pageSize=100", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch lecturers");
      const data = await res.json();
      // Handle paginated response: { items: [...] }
      const items = data.items || (Array.isArray(data) ? data : []);
      const mapped = items.map((item: any) => ({
        id: item?.user?.id || item?.userProfileViewModel?.userId || item?.studentId || "",
        fullName: item?.userProfileViewModel?.fullName || item?.user?.username || "N/A",
        email: item?.user?.email || "",
        username: item?.user?.username || "",
      }));
      setLecturers(mapped);
    } catch (error) {
      console.error("Error fetching lecturers:", error);
    }
  }, []);

  // Fetch assigned lecturers for this course
  const fetchAssignedLecturers = React.useCallback(async () => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/proxy/LecturerCourse/by-courses/${courseId}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        if (res.status === 404) {
          setAssignedLecturers([]);
          return;
        }
        throw new Error("Failed to fetch assigned lecturers");
      }
      const data = await res.json();
      setAssignedLecturers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching assigned lecturers:", error);
      setAssignedLecturers([]);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  React.useEffect(() => {
    if (isOpen) {
      fetchLecturers();
      fetchAssignedLecturers();
    }
  }, [isOpen, fetchLecturers, fetchAssignedLecturers]);

  // Assign lecturer to course
  const handleAssign = async () => {
    if (!selectedLecturerId || !courseId) return;

    setIsAssigning(true);
    try {
      const res = await fetch("/api/proxy/LecturerCourse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lecturerId: selectedLecturerId,
          courseId: courseId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to assign lecturer");
      }

      toast({ title: "Thành công", description: "Đã thêm giảng viên vào khóa học" });
      setSelectedLecturerId("");
      fetchAssignedLecturers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Không thể thêm giảng viên",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  // Remove lecturer from course
  const handleRemove = async (lecturerCourseId: string) => {
    try {
      const res = await fetch(`/api/proxy/LecturerCourse/${lecturerCourseId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to remove lecturer");

      toast({ title: "Thành công", description: "Đã xóa giảng viên khỏi khóa học" });
      fetchAssignedLecturers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa giảng viên",
      });
    }
  };

  // Filter out already assigned lecturers
  const availableLecturers = lecturers.filter(
    (l) => !assignedLecturers.some((al) => al.lecturerId === l.id)
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Phân công Giảng viên - {courseName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add new lecturer */}
          <div className="space-y-2">
            <Label>Thêm giảng viên mới</Label>
            <div className="flex gap-2">
              <Select value={selectedLecturerId} onValueChange={setSelectedLecturerId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Chọn giảng viên..." />
                </SelectTrigger>
                <SelectContent>
                  {availableLecturers.length === 0 ? (
                    <SelectItem value="_none" disabled>
                      Không có giảng viên khả dụng
                    </SelectItem>
                  ) : (
                    availableLecturers.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.fullName} ({l.email || l.username})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button onClick={handleAssign} disabled={!selectedLecturerId || isAssigning}>
                {isAssigning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* List assigned lecturers */}
          <div className="space-y-2">
            <Label>Giảng viên đã phân công ({assignedLecturers.length})</Label>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : assignedLecturers.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">
                Chưa có giảng viên nào được phân công
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {assignedLecturers.map((al) => {
                  const lecturer = lecturers.find((l) => l.id === al.lecturerId);
                  return (
                    <div
                      key={al.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {lecturer?.fullName || al.lecturer?.fullName || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {lecturer?.email || al.lecturer?.email || ""}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemove(al.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
