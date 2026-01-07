import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, updateCurrentUser } from "@/lib/utils/auth";
import { GroupService } from "@/lib/api/groupService";
import { TaskService } from "@/lib/api/taskService";
import { CourseService } from "@/lib/api/courseService";
import { mockGrades } from "@/lib/mock-data/grades";
import type { User, Task } from "@/lib/types";

export function useStudentDashboardData() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<any | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeCourses, setActiveCourses] = useState<any[]>([]);
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>("");
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // 1. Initial Load & User State Listener
  useEffect(() => {
    const currentUser = getCurrentUser() as User | null;
    if (!currentUser || currentUser.role !== "student") {
      router.push("/login");
      return;
    }
    setUser(currentUser);

    const handleUserStateChange = () => {
      const updatedUser = getCurrentUser() as User | null;
      setUser(updatedUser);
      console.log("📡 [Dashboard] User state updated:", updatedUser?.groupId);
    };

    window.addEventListener("userStateChanged", handleUserStateChange);
    return () =>
      window.removeEventListener("userStateChanged", handleUserStateChange);
  }, [router]);

  // 2. Fetch Data Logic
  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log("[Dashboard] Fetching data for userId:", user.userId);

      let groupData = null;

      // Try fetching group from API first
      try {
        groupData = await GroupService.getGroupByStudentId(user.userId);
        console.log("[Dashboard] Group data from API:", groupData);
      } catch (apiError) {
        console.warn("[Dashboard] Could not fetch group from API:", apiError);
        // Fallback to stored groupId
        if (user.groupId) {
          try {
            groupData = await GroupService.getGroupById(String(user.groupId));
            console.log(
              "[Dashboard] Group data from stored groupId:",
              groupData
            );
          } catch (fallbackError) {
            console.warn(
              "[Dashboard] Could not fetch group from stored groupId:",
              fallbackError
            );
          }
        }
      }

      if (groupData) {
        // User has a group
        setGroup(groupData);
        const ts = await TaskService.getTasksByGroupId(
          String(groupData.groupId)
        );
        setTasks(ts);
        setActiveCourses([]);

        // Update local user state if needed
        if (groupData.groupId !== user.groupId) {
          console.log(
            "[Dashboard] Updating user groupId:",
            user.groupId,
            "→",
            groupData.groupId
          );
          const updatedUser = { ...user, groupId: groupData.groupId };
          updateCurrentUser(updatedUser);
        }
      } else {
        // User doesn't have a group
        const courses = await CourseService.getCourses();
        const list = (Array.isArray(courses) ? courses : []).filter(
          (c) => String((c as any).status || "").toLowerCase() !== "inactive"
        );
        setActiveCourses(list);
        setGroup(null);
        setTasks([]);

        // Auto-select first course and load groups
        if (list.length > 0) {
          const firstCode = list[0].courseCode || "";
          setSelectedCourseCode(firstCode);
          fetchGroupsForCourse(firstCode);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper to fetch groups for a specific course
  const fetchGroupsForCourse = async (courseCode: string) => {
    setLoadingGroups(true);
    try {
      const res = await fetch(
        `/api/proxy/Group/GetAllGroups?CourseCode=${encodeURIComponent(
          (courseCode || "").toLowerCase()
        )}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        const normalized = list.map((d: any) => ({
          groupId:
            d.groupId ||
            d.id ||
            d.Id ||
            d.GroupId ||
            d.groupID ||
            d.GroupID ||
            "",
          name:
            d.name ||
            d.groupName ||
            d.group_name ||
            d.GroupName ||
            d.groupName ||
            "",
          memberCount:
            (d.countMembers ??
              d.memberCount ??
              (Array.isArray(d.members) ? d.members.length : undefined)) ||
            0,
          raw: d,
        }));
        setAvailableGroups(normalized);
      } else {
        console.warn(
          "Failed to load groups for course",
          courseCode,
          res.status
        );
        setAvailableGroups([]);
      }
    } catch (err) {
      console.error("Error loading groups:", err);
      setAvailableGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  };

  // Trigger fetch when user is set
  useEffect(() => {
    if (user) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Computed Values
  const upcomingTasks = useMemo(() => {
    if (!user) return [];
    const today = new Date();
    return tasks
      .filter((t) => t.assignedToId === user.userId && t.status !== "graded")
      .filter((t) => new Date(t.dueDate) >= today)
      .sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      )
      .slice(0, 3);
  }, [tasks, user]);

  const taskStats = useMemo(() => {
    const me = tasks.filter((t) => t.assignedToId === (user?.userId || ""));
    const pending = me.filter((t) => t.status === "pending").length;
    const inprogress = me.filter((t) => t.status === "in-progress").length;
    const completed = me.filter((t) => t.status === "graded").length;
    return [
      { name: "Pending", value: pending },
      { name: "In Progress", value: inprogress },
      { name: "Done", value: completed },
    ];
  }, [tasks, user]);

  const gpa = useMemo(() => {
    if (!user) return 0;
    const individual = mockGrades.filter((g) => g.studentId === user.userId);
    if (individual.length === 0) return 0;
    const avg =
      individual.reduce((s, g) => s + (g.score || 0), 0) / individual.length;
    return Math.round(avg * 100) / 100;
  }, [user]);

  const handleCourseSelect = (code: string) => {
    setSelectedCourseCode(code);
    fetchGroupsForCourse(code);
  };

  const joinGroup = async (groupId: string) => {
    if (!user) return;
    try {
      await GroupService.joinGroup(groupId, user.userId);
      // Update local user state
      const cur = getCurrentUser();
      if (cur) updateCurrentUser(cur);
      window.dispatchEvent(new CustomEvent("userStateChanged"));
      router.push(`/student/groups/${groupId}`);
    } catch (err) {
      console.error("Join group failed", err);
    }
  };

  return {
    user,
    loading,
    group,
    tasks,
    activeCourses,
    selectedCourseCode,
    availableGroups,
    loadingGroups,
    upcomingTasks,
    taskStats,
    gpa,
    handleCourseSelect,
    joinGroup,
    refresh: fetchData,
  };
}
