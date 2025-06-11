export interface AuthResponse {
  success: boolean;
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
}

export type UserRole = 'social-worker' | 'admin' | 'user';

export type OAuthProvider = 'kakao' | 'naver';