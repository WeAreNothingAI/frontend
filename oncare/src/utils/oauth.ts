// utils/oauth.ts - 타입 문제 해결
import { OAUTH_PROVIDERS } from "@/constants/auth";
import type { OAuthProvider } from "@/types/auth";

export const generateOAuthUrl = (provider: OAuthProvider): string | null => {
  // 🔥 카카오 로그인은 백엔드 주소로 직접 리다이렉트
  if (provider === "KAKAO") {
    // 환경 변수에서 카카오 로그인 URL을 가져옵니다.
    const kakaoAuthUrl = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;
    if (!kakaoAuthUrl) {
      console.error(
        "KAKAO 로그인 URL이 설정되지 않았습니다. (NEXT_PUBLIC_KAKAO_REDIRECT_URI)"
      );
      return null;
    }
    return kakaoAuthUrl;
  }

  const config = OAUTH_PROVIDERS[provider];
  const clientId = process.env[config.clientIdKey as keyof NodeJS.ProcessEnv];
  const redirectUri =
    process.env[config.redirectUriKey as keyof NodeJS.ProcessEnv];

  if (!clientId || !redirectUri) {
    console.error(`Missing OAuth config for ${provider}:`, {
      clientId,
      redirectUri,
    });
    return null;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
  });

  // 🔥 'naver' → 'NAVER'로 변경
  if (provider === "NAVER") {
    const state = generateRandomState();
    params.append("state", state);

    // CSRF 방지를 위해 state 저장
    if (typeof window !== "undefined") {
      sessionStorage.setItem("oauth_state", state);
    }
  }

  return `${config.authUrl}?${params.toString()}`;
};

export const generateRandomState = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

export const validateNaverState = (state: string): boolean => {
  if (typeof window === "undefined") return false;

  const savedState = sessionStorage.getItem("oauth_state");
  sessionStorage.removeItem("oauth_state"); // 사용 후 제거

  return savedState === state;
};