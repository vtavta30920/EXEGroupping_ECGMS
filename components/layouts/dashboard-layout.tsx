"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/utils/auth";
// import { LayoutDashboard, BookOpen, Users, ClipboardList, Award, LogOut, Menu, X, User as UserIcon, UserX } from "lucide-react"
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ClipboardList,
  Award,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  UserX,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "lecturer" | "student" | "admin";
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userGroupId, setUserGroupId] = useState<string | null>(null);

  // Function to check group membership from API
  const checkGroupMembership = async (currentUser: any) => {
    if (!currentUser || currentUser.role !== "student") {
      setUserGroupId(null);
      return;
    }

    try {
      const { GroupService } = await import("@/lib/api/groupService");

      // Use userId from currentUser (stored in localStorage)
      let uid = currentUser.userId;
      console.log("🔍 [Sidebar] Checking group membership for uid:", uid);

      const isGuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          uid
        );

      if (!isGuid) {
        console.warn("⚠️ [Sidebar] uid is not a valid GUID:", uid);
        setUserGroupId(null);
        return;
      }

      // Use GroupService.getGroupByStudentId which is more reliable
      const group = await GroupService.getGroupByStudentId(uid);
      console.log("📋 [Sidebar] GroupService response:", group);
      console.log(
        "📋 [Sidebar] Response type:",
        typeof group,
        "Is array:",
        Array.isArray(group)
      );

      // Handle both single group object and array response
      let groupData = null;
      if (Array.isArray(group) && group.length > 0) {
        groupData = group[0];
        console.log(
          "📋 [Sidebar] Got array response, using first item:",
          groupData
        );
      } else if (group && typeof group === "object" && group.groupId) {
        groupData = group;
        console.log("📋 [Sidebar] Got object response:", groupData);
      }

      if (groupData && groupData.groupId) {
        setUserGroupId(groupData.groupId);
        console.log("✅ [Sidebar] Found group from API:", groupData.groupId);
        return;
      }

      console.log("ℹ️ [Sidebar] No group found for user");
      setUserGroupId(null);
    } catch (err) {
      console.warn("⚠️ [Sidebar] Could not check group membership:", err);
      setUserGroupId(null);
    }
  };

  // Load user data and check group membership from API
  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    checkGroupMembership(currentUser);

    // Listen for user state changes
    const handleUserStateChange = () => {
      const updatedUser = getCurrentUser();
      console.log(
        "📡 [Sidebar] User state changed, re-checking group membership"
      );
      setUser(updatedUser);
      checkGroupMembership(updatedUser);
    };

    window.addEventListener("userStateChanged", handleUserStateChange);
    return () =>
      window.removeEventListener("userStateChanged", handleUserStateChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/login");
  };

  const lecturerNavItems = [
    { name: "Dashboard", href: "/lecturer/dashboard", icon: LayoutDashboard },
    { name: "Groups", href: "/lecturer/groups", icon: Users },
    {
      name: "Ungrouped Students",
      href: "/lecturer/students-without-group",
      icon: UserX,
    },
    { name: "Tasks", href: "/lecturer/tasks", icon: ClipboardList },
    { name: "Grades", href: "/lecturer/grades", icon: Award },
  ];

  const studentNavItems = [
    { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    {
      name: userGroupId ? "Vào Không Gian Làm Việc" : "My Group",
      href: userGroupId ? `/student/groups/${userGroupId}` : "/student/group",
      icon: Users,
    },
    { name: "My Tasks", href: "/student/tasks", icon: ClipboardList },
    { name: "Profile", href: "/student/profile", icon: UserIcon },
  ];

  const adminNavItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Import", href: "/admin/users", icon: Users },
    { name: "Courses", href: "/admin/courses", icon: BookOpen },
    { name: "Groups", href: "/admin/groups", icon: Users },
  ];

  const navItems =
    role === "lecturer"
      ? lecturerNavItems
      : role === "student"
      ? studentNavItems
      : adminNavItems;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-white">FU</span>
              </div>
              <div>
                <p className="font-bold text-gray-900">FPT University</p>
                <p className="text-xs text-gray-600 capitalize">{role}</p>
              </div>
            </div>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  router.push(item.href);
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 bg-transparent"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex-1" />
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
