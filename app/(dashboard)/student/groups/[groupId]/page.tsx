"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Users, Crown, Pencil, UserMinus, UserPlus, Lock, Unlock } from "lucide-react"
import { getCurrentUser } from "@/lib/utils/auth"
import { GroupService } from "@/lib/api/groupService"
import { GroupMemberService } from "@/lib/api/generated/services/GroupMemberService"
import { TopicService } from "@/lib/api/generated/services/TopicService"

export default function StudentGroupDetailPage() {
  const router = useRouter()
  const params = useParams() as { groupId?: string }
  const [user, setUser] = React.useState<any>(null)
  const [group, setGroup] = React.useState<any | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [topicOpen, setTopicOpen] = React.useState(false)
  const [inviteOpen, setInviteOpen] = React.useState(false)
  const [leaveOpen, setLeaveOpen] = React.useState(false)
  const [topics, setTopics] = React.useState<any[]>([])
  const [topicName, setTopicName] = React.useState("")
  const [topicDesc, setTopicDesc] = React.useState("")
  const [inviteQuery, setInviteQuery] = React.useState("")
  const [candidates, setCandidates] = React.useState<any[]>([])
  const [inviting, setInviting] = React.useState(false)

  const groupId = params.groupId || ""

  const isLeader = React.useMemo(() => {
    const uid = user?.userId || user?.id
    return Boolean(uid && group?.leaderId && String(group.leaderId) === String(uid))
  }, [user, group])

  async function loadGroup() {
    setLoading(true)
    try {
      const g = await GroupService.getGroupById(groupId)
      setGroup(g)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    const u = getCurrentUser()
    if (!u || u.role !== "student") { router.push("/login"); return }
    setUser(u)
    if (groupId) loadGroup()
  }, [groupId])

  async function openTopicDialog() {
    setTopicOpen(true)
    setTopicName(group?.topic?.topicName || "")
    setTopicDesc(group?.topic?.description || "")
    try {
      const list = await TopicService.getApiTopic()
      setTopics(Array.isArray(list) ? list : [])
    } catch { setTopics([]) }
  }

  async function saveTopic() {
    const selected = topics.find(t => String(t?.topicName || "").trim().toLowerCase() === topicName.trim().toLowerCase())
    const topicId = selected?.id
    await GroupService.updateGroup(groupId, { name: group.groupName, courseId: group.courseId, topicId })
    setTopicOpen(false)
    await loadGroup()
  }

  async function handleKick(member: any) {
    if (!isLeader) return
    const membershipId = member?.memberId
    if (!membershipId) return
    try {
      await GroupMemberService.deleteApiGroupMember({ id: membershipId })
      await loadGroup()
    } catch {}
  }

  async function searchCandidates() {
    try {
      const res = await fetch(`/api/proxy/User/UserWithoutGroup?keyword=${encodeURIComponent(inviteQuery)}`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setCandidates(Array.isArray(data) ? data : [])
      }
    } catch { setCandidates([]) }
  }

  async function inviteUser(candidate: any) {
    if (!isLeader || !groupId) return
    setInviting(true)
    try {
      const uid = candidate?.user?.id || candidate?.userId
      if (uid) {
        await GroupService.joinGroup(groupId, uid)
        await loadGroup()
      }
    } catch {} finally { setInviting(false) }
  }

  async function handleLeave() {
    if (!user?.userId || !groupId) { setLeaveOpen(false); return }
    try {
      await GroupService.leaveGroup(groupId, user.userId)
      setLeaveOpen(false)
      router.push("/student/group")
    } catch { setLeaveOpen(false) }
  }

  async function toggleLock() {
    if (!isLeader) return
    try {
      const next = String(group?.status || '').toLowerCase() === 'finalize' ? 'open' : 'finalize'
      await GroupService.updateGroup(groupId, { name: group.groupName, courseId: group.courseId, status: next })
      await loadGroup()
    } catch {}
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{group?.groupName || 'Nhóm'}</h1>
            <p className="text-gray-600 mt-1">Môn học: {group?.courseCode || '—'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge>{group?.status || 'open'}</Badge>
            {isLeader ? (
              <Button variant="outline" onClick={toggleLock}>{String(group?.status || '').toLowerCase() === 'finalize' ? <Unlock className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />} {String(group?.status || '').toLowerCase() === 'finalize' ? 'Mở khoá' : 'Khoá nhóm'}</Button>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin Đề tài</CardTitle>
                <CardDescription>{group?.topic ? 'Đề tài đã đăng ký' : 'Chưa có đề tài'}</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2"><div className="h-6 bg-accent animate-pulse rounded" /><div className="h-20 bg-accent animate-pulse rounded" /></div>
                ) : group?.topic ? (
                  <div className="space-y-2">
                    <div className="text-lg font-semibold">{group.topic?.topicName}</div>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">{group.topic?.description || '—'}</div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">Chưa có đề tài</div>
                    {isLeader ? <Button onClick={openTopicDialog}><Pencil className="w-4 h-4 mr-2" /> Đăng ký đề tài</Button> : null}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thành viên nhóm</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2"><div className="h-10 bg-accent animate-pulse rounded" /><div className="h-10 bg-accent animate-pulse rounded" /></div>
                ) : (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Thành viên</TableHead>
                          <TableHead>Ngành</TableHead>
                          <TableHead>Vai trò</TableHead>
                          <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(group?.members || []).map((m: any) => (
                          <TableRow key={m.userId}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <img src={m.avatarUrl || '/placeholder-user.jpg'} className="w-8 h-8 rounded-full" alt="avatar" />
                                <div>
                                  <div className="font-medium flex items-center gap-1">{m.fullName}{m.role === 'leader' ? <Crown className="w-4 h-4 text-amber-500" /> : null}</div>
                                  <div className="text-xs text-gray-600">{m.userId}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{m.major}</TableCell>
                            <TableCell>{m.role}</TableCell>
                            <TableCell className="text-right">
                              {isLeader && m.role !== 'leader' ? (
                                <Button size="sm" variant="destructive" onClick={() => handleKick(m)}><UserMinus className="w-4 h-4 mr-1" /> Kick</Button>
                              ) : null}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {isLeader && (group?.memberCount || 0) < (group?.maxMembers || 0) ? (
                      <div className="flex justify-end">
                        <Button variant="outline" onClick={() => { setInviteOpen(true); setCandidates([]); setInviteQuery("") }}><UserPlus className="w-4 h-4 mr-2" /> Mời thành viên</Button>
                      </div>
                    ) : null}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> Thông tin chung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">Mentor: {group?.lecturerName || '—'}</div>
                <div className="text-sm">Môn học: {group?.courseCode || '—'}</div>
                <div className="text-sm">Trạng thái: <Badge>{group?.status || 'open'}</Badge></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="destructive" onClick={() => setLeaveOpen(true)}>Rời nhóm</Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={topicOpen} onOpenChange={setTopicOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cập nhật Đề tài</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Tên đề tài" value={topicName} onChange={e => setTopicName(e.target.value)} />
              <Textarea rows={4} placeholder="Mô tả" value={topicDesc} onChange={e => setTopicDesc(e.target.value)} />
              {topics.length > 0 && (
                <div className="text-xs text-gray-600">Có thể nhập chính xác tên đề tài trong danh sách để gắn nhanh.</div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTopicOpen(false)}>Huỷ</Button>
              <Button onClick={saveTopic}>Lưu</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mời thành viên</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Tìm theo tên/email" value={inviteQuery} onChange={e => setInviteQuery(e.target.value)} />
              <div className="flex justify-end"><Button variant="outline" onClick={searchCandidates}>Tìm</Button></div>
              <div className="space-y-2 max-h-64 overflow-auto">
                {candidates.length === 0 ? (
                  <div className="text-sm text-gray-600">Chưa có kết quả</div>
                ) : candidates.map(c => (
                  <div key={String(c?.user?.id || c?.userId)} className="flex items-center justify-between">
                    <div className="text-sm">{c?.userProfileViewModel?.fullName || c?.user?.username || c?.user?.email}</div>
                    <Button size="sm" disabled={inviting} onClick={() => inviteUser(c)}><UserPlus className="w-4 h-4 mr-1" /> Mời</Button>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog open={leaveOpen} onOpenChange={setLeaveOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Rời nhóm?</AlertDialogTitle>
              <AlertDialogDescription>Hành động này sẽ xoá bạn khỏi nhóm hiện tại.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Huỷ</AlertDialogCancel>
              <AlertDialogAction onClick={handleLeave}>Xác nhận</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  )
}
