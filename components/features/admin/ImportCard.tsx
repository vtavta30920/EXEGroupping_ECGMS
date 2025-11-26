// components/features/admin/ImportCard.tsx
"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UploadCloud, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react"

type ImportStatus = "idle" | "uploading" | "success" | "error"

interface ImportCardProps {
  title: string
  description: string
  onImport: (file: File) => Promise<any>
  disabled?: boolean
}

export function ImportCard({ title, description, onImport, disabled }: ImportCardProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [status, setStatus] = React.useState<ImportStatus>("idle")
  const [message, setMessage] = React.useState("")
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Update status if parent disabled changes
  React.useEffect(() => {
      if (disabled && status !== 'uploading') {
          // Optional logic
      }
  }, [disabled, status]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setStatus("idle")
      setMessage("")
    }
  }

  const handleUploadClick = () => {
    if (!disabled && status !== 'uploading') {
        fileInputRef.current?.click()
    }
  }

  const handleImport = async () => {
    if (!selectedFile) return
    
    setStatus("uploading")
    setMessage("")
    
    try {
      const result = await onImport(selectedFile)
      setStatus("success")
      setMessage(result.message || "Nhập dữ liệu thành công!")
    } catch (error: any) {
      setStatus("error")
      // Thông báo lỗi đã được set từ component cha qua prop onImport nếu throw error,
      // nhưng ở đây ta set lại để hiển thị trong card
      setMessage(error.message || "Đã xảy ra lỗi khi nhập file.")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Vùng chọn file */}
        <div
          className={`border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors ${
            !disabled && status !== 'uploading' ? 'cursor-pointer hover:border-gray-400' : 'opacity-50 cursor-not-allowed'
          }`}
          onClick={handleUploadClick}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".xlsx, .xls, .csv"
            disabled={disabled || status === 'uploading'}
          />
          {selectedFile ? (
            <div className="flex flex-col items-center gap-2 text-sm font-medium text-gray-700">
              <FileText className="w-8 h-8 text-blue-500" />
              <span>{selectedFile.name}</span>
              <span className="text-xs text-muted-foreground">Nhấn vào đây để chọn file khác</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <UploadCloud className="w-8 h-8" />
              <span className="font-medium">Nhấn để chọn hoặc kéo thả file vào đây</span>
              <span className="text-xs">Hỗ trợ .xlsx, .xls, .csv</span>
            </div>
          )}
        </div>

        {/* Nút bấm và thông báo trạng thái */}
        {selectedFile && (
          <div className="flex items-center gap-4">
            <Button
              onClick={handleImport}
              disabled={disabled || status === "uploading"}
              className="w-full"
            >
              {(status === "uploading" || disabled) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {status === "uploading" ? "Đang xử lý..." : "Bắt đầu Nhập"}
            </Button>
          </div>
        )}
        
        {/* Thông báo kết quả */}
        {message && (
          <div className={`flex items-center gap-2 p-3 rounded-md ${status === 'success' ? 'bg-green-50 text-green-700' : status === 'error' ? 'bg-red-50 text-red-700' : 'hidden'}`}>
            {status === 'success' && <CheckCircle className="w-4 h-4" />}
            {status === 'error' && <AlertCircle className="w-4 h-4" />}
            <p className="text-sm font-medium">{message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}