import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Mail } from "lucide-react";

interface ProfileHeaderProps {
  profileName: string;
  email: string;
}

export function ProfileHeader({ profileName, email }: ProfileHeaderProps) {
  return (
    <CardHeader className="pb-2 border-b mb-0">
      <div className="flex flex-col space-y-0.5">
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          {profileName}
        </CardTitle>
        <CardDescription className="flex items-center gap-2 text-base">
          <Mail className="w-4 h-4" />
          {email}
        </CardDescription>
      </div>
    </CardHeader>
  );
}
