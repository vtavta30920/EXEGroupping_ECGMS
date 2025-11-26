"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function StudentImportGuide() {
  const handleDownloadTemplate = () => {
    const header = ["User Name","Full Name","Email","Student Code","SkillSet"].join(",")
    const sampleRows = [
      ["annvSE100100","Nguyễn Văn An","annvSE100100@fpt.edu.vn","SE100100","Backend"],
      ["binhttSE100101","Trần Thị Bình","binhttSE100101@fpt.edu.vn","SE100101","FrontEnd"],
    ]
      .map(r => r.join(","))
      .join("\n")

    const csvContent = `${header}\n${sampleRows}`
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "students_template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mẫu Import Students (CSV/Excel)</CardTitle>
        <CardDescription>
          Định dạng yêu cầu: User Name, Full Name, Email, Student Code, SkillSet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
       

        <div className="overflow-auto rounded border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-700">User Name</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">Full Name</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">Email</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">Student Code</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">SkillSet</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="px-3 py-2 font-mono">annvSE100100</td>
                <td className="px-3 py-2">Nguyễn Văn A</td>
                <td className="px-3 py-2">anvSE100100@fpt.edu.vn</td>
                <td className="px-3 py-2">SE100100</td>
                <td className="px-3 py-2">Backend</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Tải mẫu CSV bên dưới, hoặc sử dụng Excel với các cột tương tự.
          </p>
          <Button variant="outline" onClick={handleDownloadTemplate}>Tải mẫu CSV</Button>
        </div>
      </CardContent>
    </Card>
  )
}