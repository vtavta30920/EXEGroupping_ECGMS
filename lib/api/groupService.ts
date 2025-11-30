// lib/api/groupService.ts
import type { 
  Group as FeGroup, 
  GroupMember
} from "@/lib/types"; 

import {
  GroupMemberService as GeneratedGroupMemberService,
  GroupService as GeneratedGroupService,
  ApiError,
  OpenAPI,
  type Group as ApiGroup,
  type GroupMember as ApiGroupMember,
  type CreateGroupMemberViewModel,
  TopicService,
  UserService,
} from "@/lib/api/generated";
import { decodeJWT, fixUserData } from "@/lib/utils/auth";

// Export ApiGroup for use in pages
export type { ApiGroup };

/**
 * Validates if a string is a valid GUID format
 * GUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 * where each x is a hexadecimal digit (0-9, a-f, A-F)
 */
function isValidGuid(value: string): boolean {
  const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return guidRegex.test(value);
}

// Flag to enable/disable GUID validation (useful for development/testing)
const SKIP_GUID_VALIDATION = process.env.NODE_ENV === 'development' || process.env.SKIP_GUID_VALIDATION === 'true';
import type { UpdateGroupViewModel } from "@/lib/api/generated/models/UpdateGroupViewModel";

const IS_MOCK_MODE = false;
// Route tất cả gọi qua BFF Proxy để chuẩn hóa CORS và auth
OpenAPI.BASE = '/api/proxy';

// Helper lấy tên User an toàn
const getUserFullName = (user: any): string => {
    if (!user) return "N/A";
    // SỬA LỖI: Ép kiểu 'any' để tránh lỗi TS khi truy cập property không có trong type
    const u = user as any;
    if (u.firstName || u.lastName) {
        return `${u.firstName || ''} ${u.lastName || ''}`.trim();
    }
    return u.fullName || u.username || u.email || "Unknown User";
}

// --- ADAPTER ---
const mapApiGroupToFeGroup = (g: any): FeGroup => {
  if (!g) return null as any;
  
  const rawMembers = (g.groupMembers || g.members || []) as any[];
  const leaderIdRaw = g.leaderId || (g.leader?.id ?? "");
  let feMembers: GroupMember[] = rawMembers.map((gm: any) => {
    const student = gm.user || gm.student;
    // Ưu tiên fullName từ API response, sau đó từ student object, cuối cùng fallback
    let fullName = gm.fullName || (student ? getUserFullName(student) : (gm.username || gm.email || "Thành viên"));

    // Nếu vẫn không có fullName hợp lý (có thể là userId), thử fetch từ API
    if (!fullName || fullName === gm.userId || fullName === gm.id || fullName.includes('@')) {
      // Đây có thể là trường hợp cần fetch user info
      console.log("⚠️ [mapApiGroupToFeGroup] Missing fullName for userId:", gm.userId, "using:", fullName);
      // Temporarily keep the current logic, will enhance later if needed
    }

    return {
      userId: gm.userId || gm.studentId || gm.id || "",
      fullName,
      avatarUrl: (student?.userProfile as any)?.avatarUrl || "/placeholder-user.jpg",
      role: (gm.roleInGroup === 'Leader' || gm.roleInGroup === 'Group Leader' || gm.isLeader) ? 'leader' : 'member',
      major: (student?.major?.majorCode || student?.majorCode || "SE") as "SE" | "SS",
      // Add API compatibility fields
      username: gm.username || student?.username || "",
      email: gm.email || student?.email || "",
      roleInGroup: gm.roleInGroup || (gm.role === 'leader' ? 'Leader' : 'Member'),
    };
  });

  if (leaderIdRaw) {
    feMembers = feMembers.map(m => m.userId === leaderIdRaw ? { ...m, role: 'leader' } : m);
  }

  const feMajors = Array.from(new Set(feMembers.map(m => m.major))).filter(Boolean) as ("SE" | "SS")[];

  const groupName = g.name || "Chưa đặt tên";
  const groupId = g.id || "";
  return {
    groupId,
    // Add id as alias for backward compatibility
    id: groupId,
    groupName,
    // Add aliases for API compatibility
    name: groupName,
    topicName: g.topicName || null,
    courseId: g.courseId || "", 
    courseCode: g.course?.courseCode || g.courseCode || "N/A",
    courseName: g.courseName || g.course?.courseName || "N/A",
    memberCount: (g.countMembers ?? undefined) !== undefined ? (g.countMembers ?? 0) : feMembers.length || 0,
    maxMembers: g.maxMembers || 6,
    leaderName: (feMembers.find(m => m.userId === (g.leaderId || (g.leader?.id ?? "")))?.fullName) || getUserFullName(g.leader), 
    leaderId: g.leaderId || (g.leader?.id ?? ""),
    status: (g.status as FeGroup['status']) || 'open',
    majors: feMajors, 
    createdDate: g.createdAt || "", 
    members: feMembers, 
    needs: [], 
    isLockedByRule: false, 
  };
};

export class GroupService {
  static async getGroups(courseId?: string): Promise<FeGroup[]> {
    try {
      const ts = Date.now();
      const res = await fetch(`/api/proxy/Group/GetAllGroups?_t=${ts}`, {
        cache: 'no-store',
        next: { revalidate: 0 },
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`GetAllGroups failed: ${res.status} ${res.statusText} ${text}`);
      }
      const groupsFromApi = await res.json();
      let feGroups = (Array.isArray(groupsFromApi) ? groupsFromApi : []).map(mapApiGroupToFeGroup);
      if (courseId) {
        feGroups = feGroups.filter(g => g.courseId === courseId);
      }
      return feGroups;
    } catch (err) {
      console.error("Lỗi API getGroups:", err);
      return []; 
    }
  }

  static async getGroupById(id: string): Promise<FeGroup | null> {
    try {
      const res = await fetch(`/api/proxy/Group/GetGroupBy/${id}`, {
        cache: 'no-store',
        next: { revalidate: 0 },
      });
      if (res.status === 404) return null;
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`GetGroupBy failed: ${res.status} ${res.statusText} ${text}`);
      }
      const groupFromApi = await res.json();
      console.log("🔍 [getGroupById] API response:", groupFromApi);
      console.log("🔍 [getGroupById] Members data:", groupFromApi?.members || groupFromApi?.groupMembers);
      console.log("🔍 [getGroupById] Sample member:", (groupFromApi?.members || groupFromApi?.groupMembers)?.[0]);
      return mapApiGroupToFeGroup(groupFromApi);
    } catch (err: any) {
      console.error("Lỗi API getGroupById:", err);
      throw err;
    }
  }

  static async getGroupByStudentId(userId: string): Promise<FeGroup | null> {
    try {
      console.log("🔍 [getGroupByStudentId] Calling API for userId:", userId);
      const res = await fetch(`/api/proxy/Group/GetGroupByStudentID/${userId}`, {
        cache: 'no-store',
        next: { revalidate: 0 },
      });

      if (res.status === 404) {
        console.log("ℹ️ [getGroupByStudentId] No group found for userId:", userId);
        return null;
      }

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`GetGroupByStudentID failed: ${res.status} ${res.statusText} ${text}`);
      }

      const groupFromApi = await res.json();
      console.log("✅ [getGroupByStudentId] Found group:", groupFromApi);

      // API trả về array, lấy group đầu tiên
      if (Array.isArray(groupFromApi) && groupFromApi.length > 0) {
        return mapApiGroupToFeGroup(groupFromApi[0]);
      }

      return null;
    } catch (err: any) {
      console.error("Lỗi API getGroupByStudentId:", err);
      throw err;
    }
  }

  static async joinGroup(groupId: string, userId: string): Promise<FeGroup> {
    try {
      if (!groupId || !userId) throw new Error("Thiếu groupId hoặc userId.");

      let resolvedUserId = String(userId);

      // 🔧 FIX: Nếu userId không phải GUID, tự động fix bằng fixUserData
      if (!isValidGuid(resolvedUserId)) {
        console.warn("⚠️ [joinGroup] userId không phải GUID, đang fix:", resolvedUserId);

        try {
          const fixedUser = await fixUserData();
          if (fixedUser && fixedUser.userId !== resolvedUserId) {
            resolvedUserId = fixedUser.userId;
            console.log("✅ [joinGroup] Đã fix userId thành:", resolvedUserId);
          } else {
            console.warn("❌ [joinGroup] Không thể fix userId");
          }
        } catch (fixError) {
          console.warn("❌ [joinGroup] Lỗi khi fix userId:", fixError);
        }

        // Validation cuối cùng
        if (!SKIP_GUID_VALIDATION && !isValidGuid(resolvedUserId)) {
          throw new Error(`userId phải là GUID hợp lệ. Nhận được: ${resolvedUserId}`);
        }
      }
      // Optional: kiểm tra nhóm đã đầy
      try {
        const g = await this.getGroupById(groupId);
        if (g && (g.memberCount >= g.maxMembers)) {
          throw new Error("Nhóm đã đầy, không thể tham gia.");
        }
      } catch {}
      
      try {
        const existing = await GeneratedGroupMemberService.getApiGroupMember({ groupId, userId: resolvedUserId });
        if (Array.isArray(existing) && existing.length > 0) {
          const updatedGroup = await this.getGroupById(groupId);
          if (!updatedGroup) throw new Error("Không thể lấy thông tin nhóm.");
          return updatedGroup;
        }
      } catch {}
      const requestBody: CreateGroupMemberViewModel = {
        groupId: groupId,
        userId: resolvedUserId
      };

      console.log("🚀 [joinGroup] POST /api/GroupMember với:", {
        groupId,
        userId: resolvedUserId,
        isValidGuid: isValidGuid(resolvedUserId)
      });

      // 🔧 FIX: Gọi API trực tiếp với format backend expect
      const apiUrl = `${OpenAPI.BASE}/api/GroupMember`;
      console.log("🔄 [joinGroup] POST trực tiếp tới:", apiUrl);

      // Thử format 1: { model: {...} }
      let requestPayload: any = { model: requestBody };
      let response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(requestPayload)
      });

      // Nếu format 1 fail, thử format 2: direct object
      if (!response.ok) {
        console.log("📦 [joinGroup] Format {model:...} failed, trying direct object...");
        requestPayload = requestBody;
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          body: JSON.stringify(requestPayload)
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ [joinGroup] All formats failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`API call failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      console.log("✅ [joinGroup] API call thành công!");
      const updatedGroup = await this.getGroupById(groupId);
      if (!updatedGroup) throw new Error("Không thể lấy thông tin nhóm.");
      return updatedGroup;
    } catch (err: any) {
      if (err instanceof ApiError) {
        const body = (err as any)?.body;
        const title = body?.title || body?.error || err.message || "Bad Request";
        const detail = body?.errors ? JSON.stringify(body.errors) : '';
        throw new Error(`${title}${detail ? `: ${detail}` : ''}`);
      }
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(msg || "Không thể thêm thành viên vào nhóm.");
    }
  }

  static async leaveGroup(groupId: string, userId: string): Promise<FeGroup | null> {
    try {
      // Validate userId is a valid GUID format (skip in development or when explicitly disabled)
      if (!SKIP_GUID_VALIDATION && !isValidGuid(userId)) {
        throw new Error("userId phải là GUID hợp lệ (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).");
      }

      // API DELETE /api/GroupMember/{id} expects userId directly, not membershipId
      // The backend finds the GroupMember by UserId == id
      await GeneratedGroupMemberService.deleteApiGroupMember({ id: userId });
      
      // Lấy lại thông tin nhóm (có thể đã giảm memberCount)
      const updatedGroup = await this.getGroupById(groupId);
      return updatedGroup;
    } catch (err: any) {
      console.error("leaveGroup error:", err);
      throw err;
    }
  }

  static async removeMemberFromGroupViaApi(params: { memberId: string; groupId?: string }): Promise<FeGroup | null> {
    try {
      const { memberId, groupId: providedGroupId } = params;
      
      // If groupId is not provided, we need to find it
      // For now, we'll require groupId to be passed
      if (!providedGroupId) {
        throw new Error("groupId is required to remove a member");
      }

      // Use leaveGroup which handles the removal logic
      return await this.leaveGroup(providedGroupId, memberId);
    } catch (err: any) {
      console.error("removeMemberFromGroupViaApi error:", err);
      throw err;
    }
  }

  static async addMemberToGroupViaApi(params: { userId: string; groupId: string }): Promise<FeGroup> {
    try {
      const { userId, groupId } = params;
      return await this.joinGroup(groupId, userId);
    } catch (err: any) {
      console.error("addMemberToGroupViaApi error:", err);
      throw err;
    }
  }

  static async createGroup(data: { name: string, courseId: string }): Promise<FeGroup> {
    try {
      // Prefer documented route: POST /api/Group/CreateGroup
      // Try include courseId first to satisfy possible DB constraints
      let res = await fetch(`/api/proxy/Group/CreateGroup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, courseId: data.courseId }),
      });
      // Fallback: if backend rejects extra fields, retry with only name
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        res = await fetch(`/api/proxy/Group/CreateGroup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: data.name }),
        });
        // Secondary fallback: if still failing, try ASCII-safe name with courseId
        if (!res.ok) {
          const ascii = (data.name || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7E]/g, '').trim() || data.name;
          res = await fetch(`/api/proxy/Group/CreateGroup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: ascii, courseId: data.courseId }),
          });
        }
      }
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`CreateGroup failed: ${res.status} ${res.statusText} ${text}`);
      }
      const createdGroup = await res.json();
      // Nếu backend bỏ qua courseId ở bước tạo, đảm bảo cập nhật sau khi tạo
      const gid = createdGroup?.id || createdGroup?.groupId;
      const createdCourseId = createdGroup?.courseId;
      if (gid && data.courseId && (createdCourseId == null || createdCourseId !== data.courseId)) {
        try {
          await this.updateGroup(gid, { courseId: data.courseId });
        } catch (e) {
          console.warn("CreateGroup: fallback update courseId failed", e);
        }
      }
      return mapApiGroupToFeGroup(createdGroup);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể tạo nhóm mới.";
      throw new Error(message);
    }
  }

  static async updateGroup(
    id: string,
    update: Partial<{
      name: string;
      courseId: string;
      topicId: string;
      maxMembers: number;
      startDate: string;
      endDate: string;
      leaderId: string;
      status: string;
    }>
  ): Promise<FeGroup> {
    try {
      // Một số bản swagger không expose đầy đủ thuộc tính (leaderId, status) trong UpdateGroupViewModel.
      // Gửi payload dạng object và để backend map các field có sẵn.
      const requestBody: Partial<UpdateGroupViewModel> & {
        leaderId?: string | null;
        status?: string | null;
      } = {
        name: update.name,
        courseId: update.courseId,
        topicId: (update as any)?.topicId as any,
        maxMembers: update.maxMembers as any,
        startDate: update.startDate as any,
        endDate: update.endDate as any,
        leaderId: update.leaderId as any,
        status: update.status as any,
      };
      if (!requestBody.courseId) {
        try {
          const current = await this.getGroupById(id);
          if (current?.courseId) {
            requestBody.courseId = current.courseId as any;
          }
        } catch {}
      }
      if (!requestBody.name) {
        try {
          const current = await this.getGroupById(id);
          if (current?.groupName) {
            requestBody.name = current.groupName;
          }
        } catch {}
      }
      const res = await fetch(`/api/proxy/Group/UpdateGroupBy/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        if (res.status === 404 && /topic/i.test(text)) {
          try {
            const raw = await fetch(`/api/proxy/Group/GetGroupBy/${id}`, { cache: 'no-store', next: { revalidate: 0 } });
            if (raw.ok) {
              const currentRaw = await raw.json();
              const currentTopicId = currentRaw?.topicId || currentRaw?.topic?.id || null;
              let useTopicId = currentTopicId;
              if (!useTopicId) {
                try {
                  const topics = await TopicService.getApiTopic();
                  const arr = Array.isArray(topics) ? topics : [];
                  const preferred = arr.find((t: any) => String(t?.topicName || '').toLowerCase() === 'exe_grouping');
                  useTopicId = preferred?.id || arr[0]?.id;
                } catch {}
              }
              if (useTopicId) {
                const retryRes = await fetch(`/api/proxy/Group/UpdateGroupBy/${id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ...requestBody, topicId: useTopicId }),
                });
                if (retryRes.ok) {
                  const updated2 = await retryRes.json();
                  return mapApiGroupToFeGroup(updated2);
                }
                const retryText = await retryRes.text().catch(() => '');
                throw new Error(`UpdateGroup failed: ${retryRes.status} ${retryRes.statusText} ${retryText}`);
              }
            }
          } catch {}
        }
        throw new Error(`UpdateGroup failed: ${res.status} ${res.statusText} ${text}`);
      }
      const updated = await res.json();
      return mapApiGroupToFeGroup(updated);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể cập nhật nhóm.";
      throw new Error(message);
    }
  }

  static async createEmptyGroups(params: { courseId: string; courseCode: string; count: number; maxMembers?: number }): Promise<FeGroup[]> {
    const { courseId, courseCode, count, maxMembers } = params;
    if (!courseId || !courseCode || !count || count <= 0) {
      throw new Error("Thiếu thông tin course hoặc số lượng nhóm không hợp lệ.");
    }
    // Tránh trùng tên: lấy danh sách tên hiện có và tăng số thứ tự
    const existing = await this.getGroups(courseId);
    const existingNames = new Set((existing || []).map(g => (g.groupName || '').trim()));

    const created: FeGroup[] = [];
    let seqNumber = 1;
    for (let i = 0; i < count; i++) {
      // Tìm tên chưa tồn tại
      let name = '';
      while (true) {
        const seq = String(seqNumber).padStart(2, '0');
        const candidate = `Group ${courseCode}-${seq}`;
        if (!existingNames.has(candidate)) {
          name = candidate;
          break;
        }
        seqNumber++;
      }

      // Tạo nhóm
      const g = await this.createGroup({ name, courseId });
      // Cập nhật thông tin phụ (ví dụ maxMembers)
      const g2 = await this.updateGroup(g.groupId, {
        name,
        courseId,
        maxMembers: maxMembers ?? g.maxMembers ?? 6,
      });
      created.push(g2);
      existingNames.add(name);
      seqNumber++;
    }
    return created;
  }

  // Load lecturers for a given course
  static async getLecturersByCourse(courseId: string): Promise<{ id: string; name: string }[]> {
    try {
      if (!courseId) {
        console.log('❌ [getLecturersByCourse] courseId is empty');
        return [];
      }
      
      console.log(`🔄 [getLecturersByCourse] Fetching lecturers for courseId: ${courseId}`);
      const res = await fetch(`/api/proxy/LecturerCourse/by-courses/${encodeURIComponent(courseId)}`, {
        cache: 'no-store',
        next: { revalidate: 0 },
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
      
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error(`❌ [getLecturersByCourse] API failed: ${res.status} ${res.statusText} ${text}`);
        throw new Error(`GetLecturersByCourse failed: ${res.status} ${res.statusText} ${text}`);
      }
      
      const data = await res.json();
      console.log('📦 [getLecturersByCourse] Raw API response:', data);
      console.log('📦 [getLecturersByCourse] Response type:', typeof data, 'Is Array:', Array.isArray(data));
      
      // Handle multiple possible response formats
      let items: any[] = [];
      if (Array.isArray(data)) {
        items = data;
      } else if (data?.items) {
        items = data.items;
      } else if (data?.value) {
        items = data.value;
      } else if (data?.$values) {
        items = data.$values;
      } else if (typeof data === 'object' && data !== null) {
        // If it's a single object (not array), try to handle it
        console.log('📦 [getLecturersByCourse] Treating as single object');
        items = [data];
      }
      console.log(`✅ [getLecturersByCourse] Extracted ${items.length} lecturer mappings from response`);
      
      if (items.length === 0) {
        console.warn('⚠️ [getLecturersByCourse] No items found in response');
        return [];
      }
      
      // Build lecturer list with IDs extracted from the mapping.
      // Backend format: { course: {...}, lecturer: { id: GUID, username, fullname } }
      // Prioritize lecturer.id as ID (this is what the UpdateLecturer API expects).
      const lecturerIds = new Set<string>();
      const nameMap = new Map<string, string>();
      items.forEach((item, idx) => {
        console.log(`   [Item ${idx}]:`, item);
        // Prioritize new lecturerId field first, then lecturer.lecturerId, then lecturer.id, then username
        const lecturerId = item?.lecturerId || item?.lecturer?.lecturerId || item?.lecturer?.id || item?.lecturer?.username || item?.id;
        const lecturerNameFromItem = item?.lecturer?.fullname || item?.lecturer?.fullName || item?.lecturer?.name || null;
        if (lecturerId) {
          lecturerIds.add(String(lecturerId));
          if (lecturerNameFromItem) nameMap.set(String(lecturerId), lecturerNameFromItem);
          console.log(`   ✓ Extracted lecturer ID: ${lecturerId}`, lecturerNameFromItem ? `name=${lecturerNameFromItem}` : '');
        } else {
          console.log(`   ✗ No lecturer ID found in item`);
        }
      });

      console.log(`📋 [getLecturersByCourse] Found ${lecturerIds.size} unique lecturer IDs/usernames:`, Array.from(lecturerIds));

      if (lecturerIds.size === 0) {
        console.warn('⚠️ [getLecturersByCourse] No lecturer IDs extracted from items');
        return [];
      }

      // Now resolve display names: if backend provided fullname use it; otherwise try to fetch user info
      const lecturers: { id: string; name: string }[] = [];
      const userFetchPromises = Array.from(lecturerIds).map(async (lecturerId) => {
        try {
          // If name was provided in the mapping, use it directly (no extra fetch)
          if (nameMap.has(lecturerId)) {
            const name = nameMap.get(lecturerId) || lecturerId;
            return { id: lecturerId, name };
          }

          console.log(`📡 [getLecturersByCourse] Fetching user details for lecturerId/username: ${lecturerId}`);
          const userRes = await fetch(`/api/proxy/User/${encodeURIComponent(lecturerId)}`, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
          });

          if (userRes.ok) {
            const user = await userRes.json();
            console.log(`👤 [getLecturersByCourse] User data for ${lecturerId}:`, user);
            const name = user?.userProfile?.fullName || user?.username || user?.email || lecturerId;
            return { id: lecturerId, name };
          } else {
            console.warn(`⚠️ [getLecturersByCourse] User fetch failed for ${lecturerId}: ${userRes.status}`);
            // Fallback: use lecturer ID/username as label
            return { id: lecturerId, name: `${lecturerId}` };
          }
        } catch (err) {
          console.warn(`❌ [getLecturersByCourse] Error fetching user for ${lecturerId}:`, err);
          return { id: lecturerId, name: `${lecturerId}` };
        }
      });

      const results = await Promise.all(userFetchPromises);
      lecturers.push(...results.filter(r => r !== null));

      console.log(`📋 [getLecturersByCourse] Final lecturers list (${lecturers.length} items):`, lecturers);

      if (lecturers.length === 0) {
        console.warn('⚠️ [getLecturersByCourse] Final list is empty after processing');
      }

      return lecturers;
    } catch (err) {
      console.error('❌ [getLecturersByCourse] Fatal error:', err);
      return [];
    }
  }

  // Debug helper: return raw response body from LecturerCourse endpoint
  static async getLecturersRaw(courseId: string): Promise<any> {
    try {
      if (!courseId) return null;
      console.log(`🔎 [getLecturersRaw] Fetching raw LecturerCourse for courseId: ${courseId}`);
      const res = await fetch(`/api/proxy/LecturerCourse/by-courses/${encodeURIComponent(courseId)}`, {
        cache: 'no-store',
        next: { revalidate: 0 },
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
      console.log(`🔎 [getLecturersRaw] Response status: ${res.status} ok=${res.ok} content-type=${res.headers.get('content-type')}`);
      const text = await res.text().catch(() => '')
      try {
        return JSON.parse(text || 'null');
      } catch (e) {
        return text;
      }
    } catch (err) {
      console.error('❌ [getLecturersRaw] Error:', err);
      return null;
    }
  }

  // Update group lecturer
  static async updateGroupLecturer(groupId: string, lecturerId: string): Promise<void> {
    try {
      if (!groupId || !lecturerId) {
        throw new Error('groupId and lecturerId are required');
      }
      const url = `/api/proxy/Group/UpdateLecturer${groupId}?lecturerId=${encodeURIComponent(lecturerId)}`;
      console.log('📡 [updateGroupLecturer] Calling API:', { groupId, lecturerId, url });
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
      console.log('📡 [updateGroupLecturer] Response status:', res.status, 'ok:', res.ok);
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error('❌ [updateGroupLecturer] API error response:', { status: res.status, statusText: res.statusText, text });
        throw new Error(`UpdateGroupLecturer failed: ${res.status} ${res.statusText} ${text}`);
      }
      console.log('✅ [updateGroupLecturer] Success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update group lecturer';
      console.error('❌ [updateGroupLecturer] Error:', message);
      throw new Error(message);
    }
  }
}
