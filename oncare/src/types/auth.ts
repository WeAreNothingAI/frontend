export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: User;
}

export interface User {
  id: number; // 백엔드는 number 타입 사용
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// 🔥 백엔드 ERD에 맞춘 Role enum
export type UserRole = 'careWorker' | 'socialWorker';

// 🔥 백엔드 명세에 맞춘 대문자 형식
export type OAuthProvider = 'KAKAO' | 'GOOGLE' | 'NAVER';