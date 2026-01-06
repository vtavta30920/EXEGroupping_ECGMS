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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Personal Information */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="h-full border-t-4 border-t-primary shadow-sm">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Thông tin</h3>
              <Badge
                variant={status === "active" ? "default" : "secondary"}
                className={
                  status === "active" ? "bg-green-600 hover:bg-green-700" : ""
                }
              >
                {status === "active" && (
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                )}
                {status.toUpperCase()}
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <BookOpen className="w-4 h-4" />
                  <span>Chuyên ngành</span>
                </div>
                <div className="font-medium pl-6">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      {majorCode}
                    </Badge>
                    <span className="text-sm">{majorName}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Ngày sinh</span>
                </div>
                <div className="font-medium pl-6 text-sm">
                  {user.birthday
                    ? new Date(user.birthday).toLocaleDateString("vi-VN")
                    : "Chưa cập nhật"}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Phone className="w-4 h-4" />
                  <span>Liên hệ</span>
                </div>
                <div className="font-medium pl-6 text-sm">
                  {user.contactInfo || "Chưa cập nhật"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Bio & Skills */}
      <div className="lg:col-span-2 space-y-6">
        {/* Bio Section */}
        <Card className="shadow-sm bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Quote className="w-5 h-5 text-primary/60" />
              <h3 className="font-semibold text-lg">Giới thiệu</h3>
            </div>
            <p className="text-gray-700 leading-relaxed pl-7">{bio}</p>
          </CardContent>
        </Card>

        {/* Skills Section */}
        <Card className="shadow-sm">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <div className="w-1 h-6 bg-primary rounded-full"></div>
              Kỹ năng chuyên môn
            </h3>

            <div className="pl-3">
              {selectedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="px-3 py-1 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100"
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
