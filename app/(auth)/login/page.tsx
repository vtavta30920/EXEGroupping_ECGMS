"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, AlertCircle } from "lucide-react";
import type { User } from "@/lib/types";
import { decodeJWT, updateCurrentUser } from "@/lib/utils/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const requestBody = {
        email: email,
        password: password || "",
      };

      console.log("[v0] Sending login request:", requestBody);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      console.log("[v0] Response status:", response.status);
      console.log("[v0] Response ok:", response.ok);

      let responseData: any;
      try {
        responseData = await response.json();
        console.log("[v0] Response data:", {
          token: responseData.token ? "✓" : "✗",
          keys: Object.keys(responseData),
        });
      } catch (parseError) {
        console.error("[v0] Failed to parse response:", parseError);
        throw new Error("Phản hồi từ server không hợp lệ");
      }

      if (!response.ok) {
        const errorMessage = responseData.error || "Đăng nhập thất bại";
        console.error("[v0] Login failed:", errorMessage);
        throw new Error(errorMessage);
      }

      const token = responseData.token;
      const apiUser = responseData.user || {};

      if (!token) {
        console.error("[v0] No token in response:", responseData);
        throw new Error("Không nhận được token từ server");
      }

      let userRole = "student";
      try {
        const decoded = decodeJWT(token);
        if (decoded?.role) {
          userRole = decoded.role.toLowerCase();
        }
        console.log("[v0] Decoded role:", userRole);
      } catch (decodeErr) {
        console.warn(
          "[v0] Failed to decode JWT, using default role:",
          decodeErr
        );
      }

      // Store token
      try {
        localStorage.setItem("token", token);
        console.log("[v0] Token stored in localStorage");
      } catch (err) {
        console.warn("[v0] Failed to store token:", err);
      }

      // Normalize user data
      const normalized: User = {
        userId: apiUser.id || apiUser.userId || "",
        username: apiUser.username || email,
        fullName: apiUser.username || email,
        email: apiUser.email || email,
        role: (userRole as "lecturer" | "student" | "admin") || "student",
        skillSet: apiUser.skillSet,
      };

      console.log("[v0] User normalized:", normalized);
      updateCurrentUser(normalized);

      // Redirect based on role
      console.log("[v0] Redirecting to:", `/${userRole}/dashboard`);
      if (userRole === "admin") {
        router.push("/admin/dashboard");
      } else if (userRole === "lecturer") {
        router.push("/lecturer/dashboard");
      } else {
        router.push("/student/dashboard");
      }
    } catch (err: any) {
      let msg = "Lỗi đăng nhập";
      if (err?.message) {
        msg = err.message;
      }
      console.error("[v0] Login error:", err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-blue-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
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
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="text"
                  placeholder="Nhập email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Mật khẩu
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium h-11 shadow-md transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
