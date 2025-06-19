import { OAUTH_PROVIDERS } from '@/constants/auth';
import type { OAuthProvider } from '@/types/auth';

export const generateOAuthUrl = (provider: OAuthProvider): string | null => {
  const config = OAUTH_PROVIDERS[provider];
  
  const clientId = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
  // 🔥 백엔드로 직접 리다이렉트 (백엔드에서 처리 후 프론트엔드로 다시 리다이렉트)
  const redirectUri = `${process.env.NEXT_PUBLIC_API_URL}/auth/kakao`;

  if (!clientId || !redirectUri) {
    console.error(`Missing OAuth config for ${provider}:`, { 
      clientId: !!clientId, 
      redirectUri: !!redirectUri
    });
    return null;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri, // 백엔드 주소
    response_type: 'code',
  });

  const url = `${config.authUrl}?${params.toString()}`;
  console.log('🔗 카카오 OAuth URL:', url);
  console.log('🎯 백엔드로 리다이렉트 후 프론트엔드로 돌아올 예정');
  
  return url;
};
