import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function LoginAlert({ error }: { error: string }) {
  if (!error) return null;

  return (
    <Alert variant="destructive" className="border-red-200 bg-red-50">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="text-sm text-red-800">
        {error}
      </AlertDescription>
    </Alert>
  );
}
