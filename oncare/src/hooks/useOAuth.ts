import { useState, useCallback } from 'react';
import { generateOAuthUrl } from '@/utils/oauth';
import type { OAuthProvider } from '@/types/auth';
import { OAUTH_PROVIDERS } from '@/constants/auth';

export const useOAuth = () => {
  const [isLoading, setIsLoading] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState<string>('');

  const handleOAuthLogin = useCallback((provider: OAuthProvider) => {
    setIsLoading(provider);
    setError('');

    try {
      const authUrl = generateOAuthUrl(provider);
      
      if (!authUrl) {
        const providerName = OAUTH_PROVIDERS[provider].name;
        setError(`${providerName} 로그인 설정이 완료되지 않았습니다.`);
        setIsLoading(null);
        return;
      }

      // 리다이렉트
      window.location.href = authUrl;
    } catch (err) {
      console.error(`${provider} 로그인 에러:`, err);
      setError('로그인 중 오류가 발생했습니다.');
      setIsLoading(null);
    }
  }, []);

  return {
    handleOAuthLogin,
    isLoading,
    error,
  };
};
