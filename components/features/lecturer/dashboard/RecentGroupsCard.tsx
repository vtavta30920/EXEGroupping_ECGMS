"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, ArrowRight } from "lucide-react";
import type { Group } from "@/lib/types/group";

interface RecentGroupsCardProps {
  groups: Group[];
}

export function RecentGroupsCard({ groups }: RecentGroupsCardProps) {
  const router = useRouter();

  // Get recent groups (sorted by createdDate, limit 5)
  const recentGroups = [...groups]
    .sort((a, b) => {
      const dateA = new Date(a.createdDate || 0).getTime();
      const dateB = new Date(b.createdDate || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Nhóm gần đây
            </CardTitle>
            <CardDescription>
              Những nhóm mới được tạo hoặc cập nhật gần nhất
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/lecturer/groups")}
          >
            Xem tất cả
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recentGroups.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Chưa có nhóm nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentGroups.map((group) => (
              <div
                key={group.groupId}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() =>
                  router.push(`/lecturer/groups/${group.groupId}`)
                }
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900">
                      {group.groupName}
                    </p>
                    {group.status && (
                      <Badge
                        variant={
                          group.status === "open"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {group.status}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {group.memberCount ||
                        group.members?.length ||
                        0}
                      /{group.maxMembers || "?"} thành viên
                    </span>
                    {group.courseName && (
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {group.courseName}
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

