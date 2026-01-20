// lib/hooks/useAdminUsers.ts
import * as React from "react";
import { toast } from "sonner";
import type {
  Student,
  SortConfig,
  SortKey,
  ViewMode,
} from "@/lib/types/admin-user";
import {
  fetchStudents,
  fetchLecturers,
  importUsers,
} from "@/lib/services/admin-users.service";

export function useAdminUsers() {
  const [isUploading, setIsUploading] = React.useState(false);

  const [students, setStudents] = React.useState<Student[]>([]);
  const [lecturers, setLecturers] = React.useState<Student[]>([]);

  const [isLoadingStudents, setIsLoadingStudents] = React.useState(true);
  const [isLoadingLecturers, setIsLoadingLecturers] = React.useState(false);

  const [lastFetchTime, setLastFetchTime] = React.useState<Date | null>(null);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedMajor, setSelectedMajor] = React.useState("all");
  const [selectedSkill, setSelectedSkill] = React.useState("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 20;

  const [viewMode, setViewMode] = React.useState<ViewMode>("student");

  const [sortConfig, setSortConfig] = React.useState<SortConfig>({
    key: null,
    direction: "asc",
  });

  // --- helpers ---
  const getUsername = React.useCallback(
    (s: Student) => s.username || "N/A",
    [],
  );
  const getFullName = React.useCallback(
    (s: Student) =>
      s.userProfile?.fullName ??
      (s.firstName || s.lastName
        ? `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim()
        : (s.username ?? "N/A")),
    [],
  );

  const getStudentCode = React.useCallback(
    (s: Student) =>
      s.userProfile?.studentCode || s.studentCode || s.username || s.id,
    [],
  );

  const getSkillSet = React.useCallback(
    (s: Student) => s.skillSet || "N/A",
    [],
  );

  // --- fetchers ---
  const reloadStudents = React.useCallback(async () => {
    setIsLoadingStudents(true);
    try {
      const data = await fetchStudents();
      setStudents(data);
      setLastFetchTime(new Date());
    } catch (e: any) {
      toast.error("Failed to load students", { description: e.message });
    } finally {
      setIsLoadingStudents(false);
    }
  }, []);

  const reloadLecturers = React.useCallback(async () => {
    setIsLoadingLecturers(true);
    try {
      const data = await fetchLecturers();
      setLecturers(data);
      setLastFetchTime(new Date());
    } catch (e: any) {
      toast.error("Failed to load lecturers", { description: e.message });
    } finally {
      setIsLoadingLecturers(false);
    }
  }, []);

  React.useEffect(() => {
    reloadStudents();
  }, [reloadStudents]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedMajor, selectedSkill, viewMode]);

  const requestSort = React.useCallback((key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  // options
  const source = viewMode === "student" ? students : lecturers;

  const majorOptions = React.useMemo(() => {
    const set = new Set<string>();
    source.forEach((s) => {
      const code = s.userProfile?.major?.majorCode || s.major?.majorCode;
      if (code) set.add(code);
    });
    return Array.from(set).sort();
  }, [source]);

  const skillOptions = React.useMemo(() => {
    const set = new Set<string>();
    source.forEach((s) => {
      if (s.skillSet) {
        s.skillSet
          .split(/[;,]/)
          .map((t) => t.trim())
          .filter(Boolean)
          .forEach((t) => set.add(t.toLowerCase()));
      }
    });
    return Array.from(set).sort();
  }, [source]);

  // data processing
  const filteredSorted = React.useMemo(() => {
    const term = searchTerm.toLowerCase();

    const filtered = source.filter((s) => {
      const matchesSearch =
        !term ||
        getUsername(s).toLowerCase().includes(term) ||
        getFullName(s).toLowerCase().includes(term) ||
        (s.email || "").toLowerCase().includes(term) ||
        (viewMode === "student"
          ? getStudentCode(s).toLowerCase().includes(term)
          : true);

      if (!matchesSearch) return false;

      if (selectedMajor !== "all") {
        const code = s.userProfile?.major?.majorCode || s.major?.majorCode;
        if (code !== selectedMajor) return false;
      }

      if (selectedSkill !== "all") {
        const tokens = (s.skillSet || "")
          .toLowerCase()
          .split(/[;,]/)
          .map((t) => t.trim());
        if (!tokens.includes(selectedSkill.toLowerCase())) return false;
      }

      return true;
    });

    if (!sortConfig.key) return filtered;

    const getValue = (st: Student) => {
      switch (sortConfig.key) {
        case "username":
          return getUsername(st).toLowerCase();
        case "fullName":
          return getFullName(st).toLowerCase();
        case "email":
          return (st.email || "").toLowerCase();
        case "studentCode":
          return getStudentCode(st).toLowerCase();
        case "skillSet":
          return getSkillSet(st).toLowerCase();
        default:
          return "";
      }
    };

    return [...filtered].sort((a, b) => {
      const aVal = getValue(a);
      const bVal = getValue(b);
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [
    source,
    searchTerm,
    selectedMajor,
    selectedSkill,
    sortConfig,
    viewMode,
    getUsername,
    getFullName,
    getStudentCode,
    getSkillSet,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize));
  const paged = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSorted.slice(start, start + pageSize);
  }, [filteredSorted, currentPage]);

  const toggleViewMode = React.useCallback(async () => {
    const next: ViewMode = viewMode === "student" ? "lecturer" : "student";
    setViewMode(next);

    if (next === "lecturer" && lecturers.length === 0) await reloadLecturers();
    if (next === "student" && students.length === 0) await reloadStudents();
  }, [
    viewMode,
    lecturers.length,
    students.length,
    reloadLecturers,
    reloadStudents,
  ]);

  const onImport = React.useCallback(
    async (file: File, type: "student" | "lecturer") => {
      setIsUploading(true);
      try {
        const data = await importUsers(file, type);
        toast.success(data?.message || "Import success");

        if (type === "student") {
          await new Promise((r) => setTimeout(r, 500));
          await reloadStudents();
        }
        if (type === "lecturer") {
          await new Promise((r) => setTimeout(r, 500));
          await reloadLecturers();
        }
        return data;
      } catch (e: any) {
        toast.error("Import failed", { description: e.message });
        throw e;
      } finally {
        setIsUploading(false);
      }
    },
    [reloadStudents, reloadLecturers],
  );

  return {
    // data
    viewMode,
    students,
    lecturers,
    rows: paged,
    totalCount: filteredSorted.length,

    // loading
    isUploading,
    isLoadingStudents,
    isLoadingLecturers,
    lastFetchTime,

    // filter/sort/paging
    searchTerm,
    setSearchTerm,
    selectedMajor,
    setSelectedMajor,
    selectedSkill,
    setSelectedSkill,
    sortConfig,
    requestSort,
    currentPage,
    setCurrentPage,
    totalPages,
    pageSize,
    majorOptions,
    skillOptions,

    // actions
    reloadStudents,
    reloadLecturers,
    toggleViewMode,
    onImport,

    // getters
    getUsername,
    getFullName,
    getStudentCode,
    getSkillSet,
  };
}
