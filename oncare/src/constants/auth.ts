import { UserRole, OAuthProvider } from "@/types/auth";

export const OAUTH_PROVIDERS: Record<OAuthProvider, {
  readonly name: string;
  readonly authUrl: string;
  readonly color: string;
  readonly icon: string;
}> = {
  KAKAO: {
    name: '카카오',
    authUrl: 'https://kauth.kakao.com/oauth/authorize',
    color: '#FEE500',
    icon: '/kakao.png',
  },
} as const;

export const AUTH_ERRORS = {
  NO_CODE: '인증 코드가 없습니다.',
  CANCELLED: '로그인이 취소되었습니다.',
  SERVER_ERROR: '서버 연결 오류가 발생했습니다.',
  INVALID_CREDENTIALS: '잘못된 인증 정보입니다.',
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
} as const;

export const USER_DASHBOARDS: Record<UserRole, string> = {
  socialWorker: '/dashboard/social-worker',
  careWorker: '/dashboard/care-worker',
};