'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function OAuthKakaoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuthData } = useAuth();
  const [error, setError] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const handleOAuthCallback = async () => {
      console.log('🔍 OAuth 카카오 콜백 처리 시작');
      console.log('🔍 현재 URL:', window.location.href);

      // 🎯 백엔드 명세에 따른 파라미터 추출
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');
      const isNewUser = searchParams.get('isNewUser') === 'true';

      // 모든 파라미터 디버깅
      const allParams = Object.fromEntries(searchParams.entries());
      console.log('📋 받은 모든 파라미터:', allParams);

      setDebugInfo({
        url: window.location.href,
        allParams,
        accessToken: accessToken ? '있음' : '없음',
        refreshToken: refreshToken ? '있음' : '없음',
        isNewUser,
        timestamp: new Date().toISOString(),
      });

      // 에러 파라미터 확인
      const urlError = searchParams.get('error');
      if (urlError) {
        setError(`OAuth 오류: ${urlError}`);
        setTimeout(() => router.push('/login?error=oauth_failed'), 3000);
        return;
      }

      // 필수 토큰 확인
      if (!accessToken || !refreshToken) {
        setError(`토큰이 없습니다. accessToken: ${accessToken ? '있음' : '없음'}, refreshToken: ${refreshToken ? '있음' : '없음'}`);
        setTimeout(() => router.push('/login?error=token_missing'), 5000);
        return;
      }

      console.log('✅ 토큰 확인 완료:', {
        accessToken: accessToken.substring(0, 20) + '...',
        refreshToken: refreshToken.substring(0, 20) + '...',
        isNewUser
      });

      try {
        // 🔥 신규/기존 사용자 분기 처리
        if (isNewUser) {
          console.log('🆕 신규 사용자 처리');
          
          // 신규 사용자 - 임시 사용자 정보 생성 (역할 선택 페이지 미구현 시)
          const newUser = {
            id: Date.now(),
            name: '신규 카카오 사용자',
            email: 'newuser@kakao.com',
            role: 'careWorker' as const, // 기본값
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          // 토큰과 사용자 정보 저장
          setAuthData(accessToken, newUser);
          localStorage.setItem('refresh_token', refreshToken);

          console.log('🆕 신규 사용자 로그인 완료');
          
          // 역할 선택 페이지 또는 기본 대시보드로 이동
          alert('신규 사용자입니다. 요양보호사 대시보드로 이동합니다.');
          router.replace('/dashboard/care-worker');
          
        } else {
          console.log('👤 기존 사용자 처리 - 사용자 정보 API 호출');
          
          // 기존 사용자 - 백엔드에서 사용자 정보 가져오기
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            });

            console.log('📡 사용자 정보 API 응답:', response.status);

            if (response.ok) {
              const userData = await response.json();
              console.log('📊 받은 사용자 데이터:', userData);
              
              // 사용자 정보 추출 (다양한 응답 형태 지원)
              const user = userData.data || userData.user || userData;
              
              if (user && user.id && user.role) {
                console.log('✅ 사용자 정보 추출 성공:', user);

                // 인증 정보 설정
                setAuthData(accessToken, user);
                localStorage.setItem('refresh_token', refreshToken);

                // 역할별 대시보드로 이동
                if (user.role === 'socialWorker') {
                  console.log('➡️ 사회복지사 대시보드로 이동');
                  router.replace('/dashboard/social-worker');
                } else if (user.role === 'careWorker') {
                  console.log('➡️ 요양보호사 대시보드로 이동');
                  router.replace('/dashboard/care-worker');
                } else {
                  console.log('➡️ 기본 대시보드로 이동');
                  router.replace('/dashboard/care-worker'); // 기본값
                }
              } else {
                throw new Error('사용자 정보가 올바르지 않습니다.');
              }
              
            } else {
              const errorText = await response.text();
              throw new Error(`API 응답 실패: ${response.status} - ${errorText}`);
            }
            
          } catch (apiError) {
            console.error('❌ 사용자 정보 API 실패:', apiError);
            
            // API 실패 시 기본 사용자 정보로 진행
            const fallbackUser = {
              id: Date.now(),
              name: '카카오 사용자',
              email: 'kakao@example.com',
              role: 'careWorker' as const,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            setAuthData(accessToken, fallbackUser);
            localStorage.setItem('refresh_token', refreshToken);
            
            console.log('⚠️ 기본 사용자 정보로 로그인 진행');
            alert('사용자 정보 조회 실패 - 기본 정보로 진행합니다.');
            router.replace('/dashboard/care-worker');
          }
        }

      } catch (error) {
        console.error('❌ OAuth 처리 중 오류:', error);
        setError(`처리 중 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        setTimeout(() => router.push('/login?error=processing_failed'), 5000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, router, setAuthData]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full">
        <div className="text-center">
          {error ? (
            <div className="text-red-600">
              <h2 className="text-xl font-bold mb-4">❌ 카카오 로그인 실패</h2>
              <p className="text-sm mb-4 whitespace-pre-wrap">{error}</p>
              <p className="text-xs text-gray-500">잠시 후 로그인 페이지로 이동합니다...</p>
              
              {/* 개발환경 디버깅 정보 */}
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-xs text-gray-600 bg-gray-200 p-2 rounded">
                    🔍 디버깅 정보 (클릭하여 펼치기)
                  </summary>
                  <div className="mt-2 text-xs bg-gray-50 p-4 rounded overflow-auto max-h-96 border">
                    <div className="mb-4">
                      <strong className="text-blue-600">📍 현재 URL:</strong>
                      <div className="bg-white p-2 mt-1 rounded border break-all text-xs">
                        {debugInfo.url}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <strong className="text-green-600">📋 URL 파라미터:</strong>
                      <pre className="bg-white p-2 mt-1 rounded border text-xs overflow-auto">
                        {JSON.stringify(debugInfo.allParams, null, 2)}
                      </pre>
                    </div>

                    <div className="mb-4">
                      <strong className="text-purple-600">🔑 토큰 상태:</strong>
                      <div className="bg-white p-2 mt-1 rounded border">
                        <p>accessToken: {debugInfo.accessToken}</p>
                        <p>refreshToken: {debugInfo.refreshToken}</p>
                        <p>isNewUser: {String(debugInfo.isNewUser)}</p>
                      </div>
                    </div>

                    <div className="p-2 bg-blue-100 rounded border-l-4 border-blue-500">
                      <p className="text-blue-800"><strong>🔧 백엔드 확인 사항:</strong></p>
                      <ul className="text-blue-700 text-xs mt-1 ml-4">
                        <li>• 리다이렉트 URL: localhost:3000/oauth/kakao</li>
                        <li>• 필수 파라미터: accessToken, refreshToken, isNewUser</li>
                        <li>• /auth/me API 엔드포인트 확인</li>
                      </ul>
                    </div>
                  </div>
                </details>
              )}
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-4">🥇 카카오 로그인 처리 중</h2>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-4">로그인 정보를 확인하고 있습니다...</p>
              
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 text-xs text-gray-500">
                  <p>🔄 OAuth 콜백 처리 중</p>
                  <p>📋 토큰 추출 → 사용자 정보 확인 → 대시보드 이동</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}