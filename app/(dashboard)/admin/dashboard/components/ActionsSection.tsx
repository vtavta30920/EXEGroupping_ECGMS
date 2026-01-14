"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle, ClipboardList, Shuffle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

export function ActionsSection() {
  const router = useRouter();
  const { toast } = useToast();

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
      <Button className="gap-2" onClick={() => router.push("/admin/courses")}>
        <PlusCircle className="w-4 h-4" />
        Thêm môn học mới
      </Button>

      <Button
        variant="outline"
        className="gap-2"
        onClick={() =>
          toast({
            title: "Duyệt đề tài",
            description: "Chức năng đang phát triển",
          })
        }
      >
        <ClipboardList className="w-4 h-4" />
        Duyệt đề tài
      </Button>
    </div>
  );
}
