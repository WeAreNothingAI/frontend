// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any;
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // 🔥 쿠키 자동 포함 (중요!)
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // 카카오 로그인 콜백
  async kakaoCallback(code: string): Promise<ApiResponse> {
    return this.request('/auth/kakao/callback', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  // 사용자 정보 조회
  async getProfile(): Promise<ApiResponse> {
    return this.request('/users/profile');
  }

  // 로그아웃
  async logout(): Promise<ApiResponse> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // 다른 API 메서드들도 동일한 패턴으로 추가
  // 예: 게시글 조회, 생성 등
}

export const api = new ApiClient();