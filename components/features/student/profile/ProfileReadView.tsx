import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface ProfileReadViewProps {
  user: any;
  profile: any;
  selectedSkills: string[];
  selectedMajor: string | undefined;
}

export function ProfileReadView({ user, profile, selectedSkills, selectedMajor }: ProfileReadViewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <Label>Họ tên:</Label>
          <p className="text-sm text-muted-foreground">{profile?.fullName || user.fullName}</p>
        </div>
        <div className="space-y-1">
          <Label>Email:</Label>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="space-y-1">
          <Label>Ngày sinh:</Label>
          <p className="text-sm text-muted-foreground">{user.birthday || "Chưa cập nhật"}</p>
        </div>
        <div className="space-y-1">
          <Label>Liên hệ:</Label>
          <p className="text-sm text-muted-foreground">{user.contactInfo || "Chưa cập nhật"}</p>
        </div>
        <div className="space-y-1">
          <Label>Chuyên ngành (Major)</Label>
          <p className="text-sm text-muted-foreground">
            {profile?.major?.majorName || selectedMajor || "Chưa cập nhật"}
          </p>
        </div>
      </div>

      <div className="space-y-1 md:col-span-2">
        <Label>Giới thiệu (Bio)</Label>
        <p className="text-sm text-muted-foreground">{profile?.bio || "Chưa cập nhật"}</p>
      </div>

      <div className="space-y-1 md:col-span-2">
        <Label>Ảnh đại diện (Avatar URL)</Label>
        <p className="text-sm text-muted-foreground">{profile?.avatarUrl || "Chưa cập nhật"}</p>
      </div>

      <div className="space-y-1">
        <Label>Bộ kỹ năng (SkillSet)</Label>
        <div className="flex flex-wrap gap-2 mt-1">
          {selectedSkills.map(skill => (
            <Badge key={skill} variant="secondary">{skill}</Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
