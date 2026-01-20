// app/(dashboard)/admin/users/page.tsx
"use client";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { StudentImportGuide } from "@/components/features/admin/StudentImportGuide";
import { ImportCard } from "@/components/features/admin/ImportCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, User } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAdminUsers } from "@/lib/hooks/useAdminUsers";

export default function AdminUsersPage() {
  const u = useAdminUsers();

  const loading =
    u.viewMode === "student" ? u.isLoadingStudents : u.isLoadingLecturers;

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Management</h1>
          <p className="text-gray-600 mt-1">Import and manage users.</p>
        </div>
        {/* Toggle + refresh */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={u.toggleViewMode}>
              {u.viewMode === "student"
                ? "Show Lecturer List"
                : "Show Student List"}
            </Button>

            {/* <Button
              variant="outline"
              size="sm"
              onClick={
                u.viewMode === "student" ? u.reloadStudents : u.reloadLecturers
              }
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button> */}
          </div>

          {u.lastFetchTime && (
            <span className="text-xs text-gray-500 hidden md:inline">
              Updated: {u.lastFetchTime.toLocaleTimeString()}
            </span>
          )}
        </div>
        {/* Import */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImportCard
            title="Import Students"
            description="Upload student list (.xlsx/.csv)"
            onImport={(f) => u.onImport(f, "student")}
            disabled={u.isUploading}
          />
          <ImportCard
            title="Import Lecturers"
            description="Upload lecturer list (.xlsx/.csv)"
            onImport={(f) => u.onImport(f, "lecturer")}
            disabled={u.isUploading}
          />
        </div>

        <StudentImportGuide />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {u.viewMode === "student" ? "Student List" : "Lecturer List"}
              <span className="ml-1 text-sm font-normal text-gray-500">
                ({u.totalCount}{" "}
                {u.viewMode === "student" ? "students" : "lecturers"})
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent>
            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6">
              <div className="md:col-span-6">
                <Input
                  value={u.searchTerm}
                  onChange={(e) => u.setSearchTerm(e.target.value)}
                  placeholder="Search: User Name, Full Name, Email, Student Code, SkillSet"
                />
              </div>

              <div className="md:col-span-3">
                <Select
                  value={u.selectedSkill}
                  onValueChange={u.setSelectedSkill}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter Skill" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Skills</SelectItem>
                    {u.skillOptions.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : u.rows.length === 0 ? (
              <div className="text-center py-12 border rounded-md bg-gray-50">
                <p className="text-gray-900 font-medium">No data found</p>
                <p className="text-gray-500 text-sm">
                  Try adjusting your search or filters.
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[160px]">User Name</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="w-[150px]">Student Code</TableHead>
                      <TableHead className="w-[160px]">SkillSet</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {u.rows.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono text-sm text-gray-700">
                          {u.getUsername(s)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {u.getFullName(s)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {s.email}
                        </TableCell>
                        <TableCell className="font-mono text-sm font-semibold text-blue-600">
                          {u.getStudentCode(s)}
                        </TableCell>
                        <TableCell
                          className="text-xs text-gray-600 max-w-[200px] truncate"
                          title={u.getSkillSet(s)}
                        >
                          {u.getSkillSet(s)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between p-4 border-t bg-gray-50/50">
                  <div className="text-sm text-gray-500">
                    Showing{" "}
                    <span className="font-medium text-gray-900">
                      {(u.currentPage - 1) * u.pageSize + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium text-gray-900">
                      {Math.min(u.currentPage * u.pageSize, u.totalCount)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-gray-900">
                      {u.totalCount}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={u.currentPage === 1}
                      onClick={() =>
                        u.setCurrentPage((p) => Math.max(1, p - 1))
                      }
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={u.currentPage >= u.totalPages}
                      onClick={() =>
                        u.setCurrentPage((p) => Math.min(u.totalPages, p + 1))
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
