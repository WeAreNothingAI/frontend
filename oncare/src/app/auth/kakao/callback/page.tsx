'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function KakaoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const handleCallback = async () => {
      console.log('🔍 카카오 리다이렉트 콜백 수신');
      console.log('🔍 현재 URL:', window.location.href);

      // 🎯 URL 파라미터에서 토큰 정보 추출
      const allParams = Object.fromEntries(searchParams.entries());
      console.log('📋 받은 모든 파라미터:', allParams);

      // 디버깅 정보 저장
      setDebugInfo({
        url: window.location.href,
        allParams,
        timestamp: new Date().toISOString(),
      });

      // 에러 확인
      const urlError = searchParams.get('error');
      const errorDescription = searchParams.get('error_description') || searchParams.get('message');
      
      if (urlError) {
        setError(`인증 오류: ${urlError} - ${errorDescription || '설명 없음'}`);
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      // 🔍 가능한 토큰 파라미터들 확인
      const possibleTokenParams = [
        'accessToken',
        'access_token',
        'token',
        'jwt',
      ];

      const possibleRefreshParams = [
        'refreshToken', 
        'refresh_token',
        'refresh',
      ];

      const possibleUserParams = [
        'user',
        'userInfo',
        'userData',
      ];

      let accessToken = null;
      let refreshToken = null;
      let user = null;

      // 토큰 추출
      for (const param of possibleTokenParams) {
        const value = searchParams.get(param);
        if (value) {
          accessToken = value;
          console.log(`✅ Access Token 발견 (${param}):`, value.substring(0, 20) + '...');
          break;
        }
      }

      // 리프레시 토큰 추출
      for (const param of possibleRefreshParams) {
        const value = searchParams.get(param);
        if (value) {
          refreshToken = value;
          console.log(`✅ Refresh Token 발견 (${param}):`, value.substring(0, 20) + '...');
          break;
        }
      }

      // 사용자 정보 추출
      for (const param of possibleUserParams) {
        const value = searchParams.get(param);
        if (value) {
          try {
            user = JSON.parse(decodeURIComponent(value));
            console.log(`✅ 사용자 정보 발견 (${param}):`, user);
            break;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (e) {
            console.log(`⚠️ ${param} 파싱 실패:`, value);
          }
        }
      }

      // 🔍 백엔드가 다른 방식으로 보낼 수 있으므로 유연하게 처리
      if (!accessToken) {
        // 혹시 data 파라미터에 JSON으로 모든 정보가 있을 수 있음
        const dataParam = searchParams.get('data');
        if (dataParam) {
          try {
            const data = JSON.parse(decodeURIComponent(dataParam));
            accessToken = data.accessToken || data.access_token;
            refreshToken = data.refreshToken || data.refresh_token;
            user = data.user;
            console.log('✅ data 파라미터에서 정보 추출:', data);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (e) {
            console.log('⚠️ data 파라미터 파싱 실패:', dataParam);
          }
        }
      }

      console.log('🔍 최종 추출된 정보:');
      console.log('- accessToken:', accessToken ? '있음' : '없음');
      console.log('- refreshToken:', refreshToken ? '있음' : '없음');
      console.log('- user:', user ? `${user.name}(${user.email})` : '없음');

      // 필수 정보 확인
      if (!accessToken) {
        setError('AccessToken을 찾을 수 없습니다. 백엔드에서 올바른 파라미터로 리다이렉트하고 있는지 확인해주세요.');
        return;
      }

      if (!user) {
        // 사용자 정보가 없어도 일단 진행 (임시)
        console.log('⚠️ 사용자 정보 없이 진행');
        user = {
          id: 'temp',
          name: '임시 사용자',
          email: 'temp@example.com',
          role: 'careWorker'
        };
      }

      try {
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
        console.log('🎉 리다이렉트 OAuth 로그인 성공!');
        router.push('/auth/login-success');

      } catch (error) {
        console.error('❌ localStorage 저장 실패:', error);
        setError('로그인 정보 저장 중 오류가 발생했습니다.');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full">
        <div className="text-center">
          {error ? (
            <div className="text-red-600">
              <h2 className="text-xl font-bold mb-4">❌ 리다이렉트 로그인 실패</h2>
              <p className="text-sm mb-4 whitespace-pre-wrap">{error}</p>
              <p className="text-xs text-gray-500">잠시 후 로그인 페이지로 이동합니다...</p>
              
              {/* 리다이렉트 방식 디버깅 정보 */}
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-xs text-gray-600 bg-gray-200 p-2 rounded">
                    🔍 리다이렉트 디버깅 정보
                  </summary>
                  <div className="mt-2 text-xs bg-gray-50 p-4 rounded overflow-auto max-h-96 border">
                    <div className="mb-4">
                      <strong className="text-blue-600">📍 리다이렉트 URL:</strong>
                      <div className="bg-white p-2 mt-1 rounded border break-all">
                        {debugInfo.url}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <strong className="text-green-600">📋 URL 파라미터:</strong>
                      <pre className="bg-white p-2 mt-1 rounded border text-xs overflow-auto">
                        {JSON.stringify(debugInfo.allParams, null, 2)}
                      </pre>
                    </div>

                    <div className="p-2 bg-blue-100 rounded border-l-4 border-blue-500">
                      <p className="text-blue-800"><strong>🔧 백엔드 확인 사항:</strong></p>
                      <ul className="text-blue-700 text-xs mt-1 ml-4">
                        <li>• 리다이렉트 URL에 accessToken 파라미터 포함하기</li>
                        <li>• 사용자 정보도 user 파라미터로 포함하기</li>
                        <li>• URL 인코딩 확인 (특히 user 정보)</li>
                        <li>• 리다이렉트 주소: http://localhost:3000/auth/kakao/callback</li>
                      </ul>
                    </div>
                  </div>
                </details>
              )}
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-4">리다이렉트 로그인 처리 중...</h2>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-4">URL 파라미터에서 토큰 정보 추출 중...</p>
              
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 text-xs text-gray-500">
                  <p>🔄 리다이렉트 방식 OAuth 처리</p>
                  <p>📋 지원 파라미터: accessToken, refreshToken, user</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}