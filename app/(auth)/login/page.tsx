"use client";

import LoginHeader from "./components/LoginHeader";
import LoginForm from "./components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md shadow-xl border-0 rounded-xl bg-white">
        <LoginHeader />
        <LoginForm />
      </div>
    </div>
  );
}
