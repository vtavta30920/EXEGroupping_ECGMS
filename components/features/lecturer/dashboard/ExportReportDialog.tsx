"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download } from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";

interface ExportReportDialogProps {
  showExportDialog: boolean;
  setShowExportDialog: (open: boolean) => void;
  exportFormat: "xlsx" | "csv";
  setExportFormat: (format: "xlsx" | "csv") => void;
}

export function ExportReportDialog({
  showExportDialog,
  setShowExportDialog,
  exportFormat,
  setExportFormat,
}: ExportReportDialogProps) {
  const { toast } = useToast();

  const handleExportReport = async () => {
    try {
      // TODO: Implement export functionality
      toast({
        title: "Đang phát triển",
        description: "Tính năng xuất báo cáo đang được phát triển",
      });
      setShowExportDialog(false);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xuất báo cáo",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Xuất báo cáo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xuất báo cáo</DialogTitle>
          <DialogDescription>
            Chọn định dạng file để xuất báo cáo tiến độ và điểm số
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="xlsx"
                name="format"
                value="xlsx"
                checked={exportFormat === "xlsx"}
                onChange={(e) =>
                  setExportFormat(e.target.value as "xlsx" | "csv")
                }
                className="w-4 h-4"
              />
              <label htmlFor="xlsx" className="text-sm font-medium">
                Excel (.xlsx)
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="csv"
                name="format"
                value="csv"
                checked={exportFormat === "csv"}
                onChange={(e) =>
                  setExportFormat(e.target.value as "xlsx" | "csv")
                }
                className="w-4 h-4"
              />
              <label htmlFor="csv" className="text-sm font-medium">
                CSV (.csv)
              </label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowExportDialog(false)}
          >
            Hủy
          </Button>
          <Button onClick={handleExportReport}>Xuất báo cáo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

