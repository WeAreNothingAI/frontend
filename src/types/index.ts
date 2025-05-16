// WebSocket 관련 타입
export interface SocketMessage {
  message: string;
  timestamp?: number;
  userId?: string;
}

export interface SocketNotification {
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

// API 관련 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// 네비게이션 타입 (이미 AppNavigator에 정의했지만 참고용)
export type RootStackParamList = {
  Home: undefined;
  Chat: { userId?: string };
  Profile: { userId: string };
};