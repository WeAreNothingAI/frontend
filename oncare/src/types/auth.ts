export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: User;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'careWorker' | 'socialWorker';
export type OAuthProvider = 'KAKAO';