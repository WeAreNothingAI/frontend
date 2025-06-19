// app/(auth)/oauth/page.tsx - Response Body 방식으로 수정
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const handleCallback = async () => {
      console.log('🔍 OAuth 콜백 시작');
      console.log('🔍 현재 URL:', window.location.href);

      // URL에서 code 파라미터 확인
      const code = searchParams.get('code');
      const urlError = searchParams.get('error');

      if (urlError) {
        setError(`카카오 인증 오류: ${urlError}`);
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      if (!code) {
        setError('인증 코드가 없습니다.');
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      try {
        console.log('✅ 카카오 인증 코드 받음:', code.substring(0, 10) + '...');
        
        // 🔥 백엔드에 GET 요청으로 토큰 요청
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/kakao?code=${encodeURIComponent(code)}`;
        console.log('📡 백엔드 API 호출 (GET):', apiUrl);

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        console.log('📥 응답 상태:', response.status, response.statusText);
        console.log('📥 응답 헤더:', Object.fromEntries(response.headers.entries()));

        // 응답 내용 확인
        const responseText = await response.text();
        console.log('📥 원본 응답:', responseText);

        // 디버깅 정보 저장
        setDebugInfo({
          url: window.location.href,
          code: code.substring(0, 10) + '...',
          apiUrl,
          responseStatus: response.status,
          responseText: responseText.substring(0, 500),
          timestamp: new Date().toISOString(),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${responseText}`);
        }

        // JSON 파싱
        let data;
        try {
          data = JSON.parse(responseText);
          console.log('✅ JSON 파싱 성공:', data);
        } catch (parseError) {
          console.error('❌ JSON 파싱 실패:', parseError);
          throw new Error(`JSON 파싱 실패: ${responseText.substring(0, 100)}`);
        }

        // 응답 데이터 구조 확인
        console.log('🔍 응답 데이터 구조:', {
          hasSuccess: 'success' in data,
          hasUser: 'user' in data,
          hasAccessToken: 'accessToken' in data,
          hasData: 'data' in data,
          keys: Object.keys(data)
        });

        // 🎯 토큰 및 사용자 정보 추출
        let user = null;
        let accessToken = null;
        let refreshToken = null;

        // 백엔드 응답 형식에 따른 처리
        if (data.success && data.data) {
          // 형식 1: { success: true, data: { user, accessToken, refreshToken } }
          user = data.data.user;
          accessToken = data.data.accessToken;
          refreshToken = data.data.refreshToken;
        } else if (data.user && data.accessToken) {
          // 형식 2: { user, accessToken, refreshToken }
          user = data.user;
          accessToken = data.accessToken;
          refreshToken = data.refreshToken;
        } else if (data.success && data.user) {
          // 형식 3: { success: true, user, accessToken, refreshToken }
          user = data.user;
          accessToken = data.accessToken;
          refreshToken = data.refreshToken;
        } else {
          throw new Error(`예상하지 못한 응답 형식: ${JSON.stringify(data)}`);
        }

        console.log('🔍 추출된 정보:', {
          user: user ? `${user.name}(${user.email})` : null,
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken
        });

        // 필수 정보 확인
        if (!user || !accessToken) {
          throw new Error('필수 정보가 누락되었습니다. user와 accessToken이 필요합니다.');
        }

        // 🏪 localStorage에 저장
        localStorage.setItem('access_token', accessToken);
        console.log('✅ Access Token 저장 완료');

        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
          console.log('✅ Refresh Token 저장 완료');
        }

        localStorage.setItem('user', JSON.stringify(user));
        console.log('✅ 사용자 정보 저장 완료:', user);

        // 🎉 성공 - 로그인 성공 페이지로 이동
        console.log('🎉 OAuth 로그인 성공! 성공 페이지로 이동');
        router.push('/auth/login-success');

      } catch (error) {
        console.error('❌ OAuth 처리 실패:', error);
        setError(error instanceof Error ? error.message : '로그인 처리 중 오류가 발생했습니다.');
        setTimeout(() => router.push('/login'), 5000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
        <div className="text-center">
          {error ? (
            <div className="text-red-600">
              <h2 className="text-xl font-bold mb-4">❌ OAuth 로그인 실패</h2>
              <p className="text-sm mb-4">{error}</p>
              <p className="text-xs text-gray-500">잠시 후 로그인 페이지로 이동합니다...</p>
              
              {/* 개발환경에서만 디버깅 정보 표시 */}
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-xs text-gray-600">🔍 디버깅 정보</summary>
                  <div className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-60">
                    <div className="mb-2">
                      <strong>호출 URL:</strong>
                      <div className="bg-white p-1 mt-1 rounded text-blue-600 break-all">
                        {debugInfo.apiUrl}
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <strong>응답 상태:</strong>
                      <div className="bg-white p-1 mt-1 rounded">
                        {debugInfo.responseStatus}
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <strong>응답 내용:</strong>
                      <pre className="bg-white p-1 mt-1 rounded text-xs overflow-auto">
                        {debugInfo.responseText}
                      </pre>
                    </div>
                    
                    <div className="mb-2">
                      <strong>인증 코드:</strong>
                      <div className="bg-white p-1 mt-1 rounded break-all">
                        {debugInfo.code}
                      </div>
                    </div>
                  </div>
                </details>
              )}
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-4">OAuth 로그인 처리 중...</h2>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-4">백엔드에서 토큰 정보를 가져오는 중...</p>
              
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 text-xs text-gray-500">
                  <p>📡 GET 요청으로 JSON 응답 대기 중...</p>
                  <p>🔍 URL: {process.env.NEXT_PUBLIC_API_URL}/auth/kakao</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}