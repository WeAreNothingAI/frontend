// constants/auth.ts - 백엔드 명세에 맞춘 수정
import { UserRole } from "@/types/auth";

export const OAUTH_PROVIDERS = {
  // 🔥 키도 대문자로 변경하여 일관성 확보
  KAKAO: {
    name: '카카오',
    authUrl: 'https://kauth.kakao.com/oauth/authorize',
    clientIdKey: 'NEXT_PUBLIC_KAKAO_CLIENT_ID',
    redirectUriKey: 'NEXT_PUBLIC_KAKAO_REDIRECT_URI',
    color: '#FEE500',
    icon: '/kakao.png',
  },
  NAVER: {
    name: '네이버',
    authUrl: 'https://nid.naver.com/oauth2.0/authorize',
    clientIdKey: 'NEXT_PUBLIC_NAVER_CLIENT_ID',
    redirectUriKey: 'NEXT_PUBLIC_NAVER_REDIRECT_URI',
    color: '#03C75A',
    icon: '/naver.png',
  },
  GOOGLE: {
    name: '구글',
    authUrl: 'https://accounts.google.com/oauth/authorize',
    clientIdKey: 'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
    redirectUriKey: 'NEXT_PUBLIC_GOOGLE_REDIRECT_URI',
    color: '#4285F4',
    icon: '/google.png',
  }
} as const;

export const AUTH_ERRORS = {
  NO_CODE: '인증 코드가 없습니다.',
  CANCELLED: '로그인이 취소되었습니다.',
  SERVER_ERROR: '서버 연결 오류가 발생했습니다.',
  INVALID_CREDENTIALS: '잘못된 인증 정보입니다.',
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
} as const;

export const USER_DASHBOARDS: Record<UserRole, string> = {
  'socialWorker': '/dashboard/social-worker', // 🔥 camelCase로 변경
  'careWorker': '/dashboard/care-worker',     // 🔥 추가
};