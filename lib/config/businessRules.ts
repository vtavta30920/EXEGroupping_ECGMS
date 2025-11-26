// lib/config/businessRules.ts
// Helper cấu hình Business Rules cho giai đoạn sinh viên tự chọn nhóm

// Có thể thay bằng cấu hình từ DB hoặc biến môi trường
const SELF_SELECT_DEADLINE_ENV = process.env.NEXT_PUBLIC_SELF_SELECT_DEADLINE;

export function getSelfSelectDeadline(): Date | null {
  if (SELF_SELECT_DEADLINE_ENV) {
    const d = new Date(SELF_SELECT_DEADLINE_ENV);
    return isNaN(d.getTime()) ? null : d;
  }
  // Mặc định: luôn mở nếu không cấu hình
  return null;
}

export function isSelfSelectOpen(): boolean {
  const deadline = getSelfSelectDeadline();
  if (!deadline) return true;
  return Date.now() <= deadline.getTime();
}