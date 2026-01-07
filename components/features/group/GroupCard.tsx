// components/features/group/GroupCard.tsx (Đã sửa lỗi Props và Import)
"use client";

// SỬA: Import Group từ lib/types.ts (camelCase)
import type { Group } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Lock, LogIn, Send, Check, Loader2, Crown } from "lucide-react";

const statusConfig = {
  open: {
    text: "Đang mở",
    variant: "secondary",
    icon: <LogIn className="w-3 h-3" />,
  },
  lock: {
    text: "Cần duyệt",
    variant: "default",
    icon: <Send className="w-3 h-3" />,
  },
  finalize: {
    text: "Đã chốt",
    variant: "destructive",
    icon: <Check className="w-3 h-3" />,
  },
  private: {
    text: "Riêng tư",
    variant: "outline",
    icon: <Lock className="w-3 h-3" />,
  },
};

// SỬA LỖI 5: Bổ sung props onJoin, onApply, isJoining
interface GroupCardProps {
  group: Group;
  onJoin?: (groupId: string) => void;
  onApply?: (groupId: string) => void;
  isJoining?: boolean;
  disableJoin?: boolean;
}

export function GroupCard({
  group,
  onJoin,
  onApply,
  isJoining = false,
  disableJoin = false,
}: GroupCardProps) {
  // Vì 'group' là kiểu FeGroup (camelCase), nên mọi thứ ở đây đều đúng
  const { text, variant, icon } =
    statusConfig[group.status] || statusConfig.open;
  const max = group.maxMembers || 6;
  const memberPercentage = (Math.min(group.memberCount, max) / max) * 100;

  const handleJoinClick = () => {
    onJoin?.(group.groupId); // Thêm ? để tránh lỗi nếu không truyền
  };

  const handleApplyClick = () => {
    onApply?.(group.groupId); // Thêm ? để tránh lỗi nếu không truyền
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle>{group.groupName}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={variant as any} className="flex items-center gap-1">
              {icon}
              {text}
            </Badge>
            {group.memberCount === 0 && (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1">
                <Crown className="w-3 h-3" /> Be a Leader!
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>Trưởng nhóm: {group.leaderName}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1 text-xs text-muted-foreground">
              <span>Thành viên</span>
              <span className="flex items-center gap-1">
                {group.memberCount}/{max}
                {group.status === "finalize" &&
                  group.memberCount === 5 &&
                  max >= 6 && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1 py-0.5"
                    >
                      chấp nhận
                    </Badge>
                  )}
              </span>
            </div>
            <Progress value={memberPercentage} />
          </div>

          {/* needs có thể không tồn tại trên mock data, thêm ? */}
          {group.needs?.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-2">Đang tìm kiếm:</p>
              <div className="flex flex-wrap gap-2">
                {group.needs.map((need, index) => (
                  <Badge key={index} variant="outline">
                    {need.count} {need.major}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {group.members?.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-2">Thành viên hiện tại:</p>
              <div className="flex -space-x-2">
                {group.members.slice(0, 5).map((member) => (
                  <Avatar key={member.userId} className="border-2 border-white">
                    <AvatarImage src={member.avatarUrl} />
                    <AvatarFallback>{member.fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                ))}
                {group.members.length > 5 && (
                  <Avatar className="border-2 border-white">
                    <AvatarFallback>+{group.members.length - 5}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {group.status === "open" && (
          <Button
            className="w-full"
            onClick={handleJoinClick}
            disabled={isJoining || disableJoin}
          >
            {isJoining && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {group.memberCount === 0
              ? "Khởi tạo nhóm & Làm Leader"
              : "Tham gia ngay"}
          </Button>
        )}
        {group.status === "lock" && (
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleApplyClick}
            disabled={isJoining || disableJoin}
          >
            {isJoining && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Nộp đơn ứng tuyển
          </Button>
        )}
        {group.status === "finalize" && (
          <Button disabled variant="outline" className="w-full">
            Nhóm đã chốt
          </Button>
        )}
        {group.status === "private" && (
          <Button disabled variant="outline" className="w-full">
            Chỉ dành cho thành viên được mời
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
