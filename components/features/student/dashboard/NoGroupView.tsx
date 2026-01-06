import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface NoGroupViewProps {
  activeCourses: any[];
  selectedCourseCode: string;
  loadingGroups: boolean;
  availableGroups: any[];
  onSelectCourse: (code: string) => void;
  onJoinGroup: (groupId: string) => void;
}

export function NoGroupView(_: NoGroupViewProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-sm text-muted-foreground">
        Bạn chưa tham gia nhóm nào
      </div>
      <Button
        className="bg-amber-600 hover:bg-amber-700 px-6 py-3 text-base"
        onClick={() => router.push("/student/group")}
      >
        Tìm nhóm theo thao tác
      </Button>
    </div>
  );
}
