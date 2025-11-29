import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function LoginHeader() {
  return (
    <CardHeader className="space-y-6 text-center pb-8">
      <div className="flex justify-center">
        <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-4xl font-bold text-white">FU</span>
        </div>
      </div>
      <div className="space-y-2">
        <CardTitle className="text-3xl font-bold text-gray-900">
          FPT University
        </CardTitle>
        <CardDescription className="text-base text-gray-600">
          EXE102 Project Management System
        </CardDescription>
      </div>
    </CardHeader>
  );
}
