const BACKEND_URL = process.env.BACKEND_URL || 'http://140.245.42.78:5050';

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data: any
  ) {
    super(`API Error ${status}: ${statusText}`);
  }
}

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    this.baseUrl = BACKEND_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(response.status, response.statusText, errorData);
      }
      
      // Xử lý trường hợp response không có body (204 No Content)
      if (response.status === 204) return {} as T;
      
      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error(`Fetch error for ${url}:`, error);
      throw new ApiError(500, 'Network Error', { message: 'Không thể kết nối đến server' });
    }
  }

  // --- Authentication ---
  async login(credentials: any) {
    return this.request<any>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // --- Users ---
  async getLecturers() {
    // Giả sử API lấy users có thể lọc theo role hoặc lấy tất cả rồi lọc
    // Nếu backend có endpoint /api/User/lecturers thì dùng nó
    return this.request<any[]>('/api/User'); 
  }

  // --- Courses ---
  async createCourse(data: any) {
    return this.request<any>('/api/Course', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();