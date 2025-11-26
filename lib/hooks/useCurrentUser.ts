import { useState, useEffect } from 'react';
import type { User } from '@/lib/types';

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra xem có user trong localStorage không (để hiển thị nhanh)
    const localUser = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
    if (localUser) {
        try {
            setUser(JSON.parse(localUser));
        } catch (e) {
            console.error("Error parsing local user", e);
        }
    }

    // Gọi API Proxy để lấy dữ liệu mới nhất và xác thực phiên làm việc
    // (Bỏ qua bước này nếu bạn chỉ muốn dùng localStorage tạm thời)
    /* const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const userData = await res.json();
          if (userData) {
            setUser(userData);
            // Cập nhật ngược lại localStorage nếu cần
            localStorage.setItem('currentUser', JSON.stringify(userData));
          } else {
             // Nếu API trả về null (token hết hạn), có thể logout
             // setUser(null);
             // localStorage.removeItem('currentUser');
          }
        }
      } catch (error) {
        console.error("Failed to fetch current user", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser(); 
    */
    
    // Tạm thời chỉ dùng LocalStorage để tránh lỗi "Failed to fetch" nếu chưa có API Auth
    setIsLoading(false);

  }, []);

  return { user, isLoading };
}