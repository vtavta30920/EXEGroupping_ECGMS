import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Calendar, Phone, Quote, CheckCircle2 } from "lucide-react";

interface ProfileReadViewProps {
  user: any;
  profile: any;
  selectedSkills: string[];
  selectedMajor: string | undefined;
}

export function ProfileReadView({
  user,
  profile,
  selectedSkills,
  selectedMajor,
}: ProfileReadViewProps) {
  const majorName =
    profile?.major?.majorName || profile?.major?.name || "Chưa cập nhật";
  const majorCode = profile?.major?.majorCode || selectedMajor || "N/A";
  const bio = profile?.bio || "Sinh Viên"; // Default fallback per requirement example if needed, or keep existing logic
  const status = profile?.status || "active";

  return (
    <div className="space-y-5">
      {/* Top Section: Status & Bio */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="md:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 border-none shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-start gap-2.5">
              <Quote className="w-4 h-4 text-blue-300 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold text-blue-900">
                  Giới thiệu
                </h3>
                <p className="text-sm text-blue-800 leading-relaxed italic">
                  "{bio}"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gray-50 flex flex-col justify-center items-center p-3">
          <div className="text-center space-y-1">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              Trạng thái
            </Label>
            <div className="flex items-center justify-center gap-2">
              <Badge
                variant={status === "active" ? "default" : "secondary"}
                className={
                  status === "active"
                    ? "bg-green-600 hover:bg-green-700 text-xs px-2 py-0.5 h-5"
                    : "text-xs px-2 py-0.5 h-5"
                }
              >
                {status === "active" && (
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                )}
                {status.toUpperCase()}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Middle Section: Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold border-l-4 border-primary pl-3">
            Thông tin cá nhân
          </h3>

          <div className="space-y-4 pl-4">
            <div className="grid grid-cols-[24px_1fr] gap-3 items-center">
              <BookOpen className="w-5 h-5 text-gray-500" />
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Chuyên ngành
                </Label>
                <div className="font-medium flex items-center gap-2">
                  <Badge variant="outline" className="font-mono">
                    {majorCode}
                  </Badge>
                  <span>{majorName}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[24px_1fr] gap-3 items-center">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Ngày sinh
                </Label>
                <div className="font-medium">
                  {user.birthday
                    ? new Date(user.birthday).toLocaleDateString("vi-VN")
                    : "Chưa cập nhật"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[24px_1fr] gap-3 items-center">
              <Phone className="w-5 h-5 text-gray-500" />
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Liên hệ
                </Label>
                <div className="font-medium">
                  {user.contactInfo || "Chưa cập nhật"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold border-l-4 border-primary pl-3">
            Kỹ năng chuyên môn
          </h3>
          <div className="pl-4">
            {selectedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="px-2 py-0.5 text-xs bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Chưa cập nhật kỹ năng nào.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
