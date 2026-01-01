import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserCircle } from "lucide-react";

interface ProfileHeaderProps {
  profileName: string;
  email: string;
}

export function ProfileHeader({ profileName, email }: ProfileHeaderProps) {
  return (
    <CardHeader className="flex flex-row items-center gap-4">
      <UserCircle className="w-12 h-12 text-gray-400" />
      <div>
        <CardTitle>{profileName}</CardTitle>
        <CardDescription>{email}</CardDescription>
      </div>
    </CardHeader>
  );
}
