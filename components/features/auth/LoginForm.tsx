// Login form component
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'
import { UserService } from '@/lib/api/generated/services/UserService'
import { RoleService } from '@/lib/api/generated/services/RoleService'
import { useRouter } from 'next/navigation'
import { ApiError } from '@/lib/api/generated/core/ApiError'

const STUDENT_ROLE_ID = '106c46d1-6ac9-413c-b883-ce67f2af6a01'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useCurrentUser()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Đăng nhập theo email bằng generated UserService (password để trống)
      let rawUser: any = null
      try {
        const res = await fetch(`/api/proxy/api/User/email/${encodeURIComponent(email)}`, { cache: 'no-store', headers: { accept: 'text/plain' } })
        if (res.ok) {
          rawUser = await res.json()
        } else if (res.status < 500) {
          rawUser = await UserService.getApiUserEmail({ email })
        } else {
          throw new Error('Máy chủ gặp sự cố, vui lòng thử lại sau')
        }
      } catch (e: any) {
        try {
          rawUser = await UserService.getApiUserEmail({ email })
        } catch {
          throw e
        }
      }
      // Debug thực tế giá trị role
      console.log('🔍 Raw User:', rawUser)
      console.log('🔍 Role object:', rawUser?.role)
      console.log('🔍 Role name raw:', rawUser?.role?.roleName)
      console.log('🔍 RoleId:', rawUser?.roleId)

      let roleName = (rawUser?.role?.roleName || '').toString().trim().toLowerCase()
      console.log('🔍 Role name after lowercase:', roleName)
      console.log('🔍 Is student by name?:', roleName === 'student')
      // Fallback: nếu role null, thử lấy từ RoleService bằng roleId
      if (!roleName && rawUser?.roleId) {
        try {
          const roleVm = await RoleService.getApiRole1({ id: rawUser.roleId })
          roleName = (roleVm?.roleName || '').toString().trim().toLowerCase()
        } catch (e) {
          // bỏ qua nếu không lấy được role
        }
      }
      const isStudentById = rawUser?.roleId === STUDENT_ROLE_ID
      const isStudentByName = roleName === 'student'
      const isStudent = isStudentById || isStudentByName
      console.log('✅ isStudentById:', isStudentById, 'isStudentByName:', isStudentByName)
      if (!isStudent) {
        throw new Error('Chỉ sinh viên (Student) được phép đăng nhập')
      }

      const normalized = {
        userId: rawUser?.id ?? '',
        username: rawUser?.username || rawUser?.email || email,
        fullName: rawUser?.userProfile?.fullName || rawUser?.username || rawUser?.email || email,
        email: rawUser?.email || email,
        role: 'student',
        groupId: rawUser?.groups?.[0]?.id || rawUser?.groupMembers?.[0]?.groupId || null,
        roleId: rawUser?.roleId,
        skillSet: (rawUser?.skillSet ?? undefined) as any,
        userProfile: rawUser?.userProfile as any,
        studentCourses: (rawUser?.studentCourses ?? undefined) as any[],
        groups: (rawUser?.groups ?? undefined) as any[],
        notifications: (rawUser?.notifications ?? undefined) as any[],
      }

      try {
        localStorage.setItem('currentUser', JSON.stringify(normalized))
      } catch (e) {
        console.warn('Failed to persist auth state', e)
      }
      setError(null)
      // Redirect based on user role (đơn giản hóa về /dashboard)
      router.push('/dashboard')
    } catch (err) {
      let msg = 'Lỗi đăng nhập'
      if (err instanceof ApiError) {
        if (err.status === 404) {
          msg = 'Không tìm thấy tài khoản với email này'
        } else if (err.status === 401) {
          msg = 'Bạn không có quyền đăng nhập'
        } else if (err.status >= 500) {
          msg = 'Máy chủ gặp sự cố, vui lòng thử lại sau'
        } else {
          msg = `${err.status} ${err.statusText}`
        }
      } else if (err instanceof Error) {
        msg = err.message
      }
      setError(msg)
      console.error('Login failed:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Đăng nhập ECGMS</CardTitle>
        <CardDescription>
          Hệ thống quản lý ghép nhóm môn học EXE
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email sinh viên"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Mật khẩu
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              placeholder="Mật khẩu có thể để trống"
              required={false}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>Demo accounts:</p>
          <div className="text-xs">Nhập email sinh viên (ví dụ: ...@fpt.edu.vn); mật khẩu để trống.</div>
        </div>
      </CardContent>
    </Card>
  )
}
