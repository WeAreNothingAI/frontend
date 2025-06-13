// app/(auth)/oauth/page.tsx
"use client"

import React, { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

// useSearchParams를 사용하는 컴포넌트를 분리
function OAuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      switch (error) {
        case 'unauthorized':
          setErrorMessage('인증에 실패했습니다. 다시 시도해주세요.');
          break;
        case 'invalid_code':
          setErrorMessage('잘못된 인증 코드입니다.');
          break;
        case 'callback_failed':
          setErrorMessage('로그인 처리 중 오류가 발생했습니다.');
          break;
        case 'no_code':
          setErrorMessage('인증 코드가 없습니다.');
          break;
        default:
          setErrorMessage('알 수 없는 오류가 발생했습니다.');
      }
    }
  }, [searchParams]);

  const handleKakaoLogin = () => {
    const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
    const REDIRECT_URI = `${process.env.NEXT_PUBLIC_API_URL}/auth/kakao/callback`;
    
    if (!KAKAO_CLIENT_ID) {
      alert('카카오 로그인 설정이 완료되지 않았습니다.');
      return;
    }
    
    const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    window.location.href = KAKAO_AUTH_URL;
  };

  // 🔥 수동 로그인 함수 (백엔드 API 호출)
  const handleManualLogin = async () => {
    try {
      console.log('수동 로그인 시도 중...');
      
      // 백엔드 /auth/me API 호출하여 쿠키 설정받기
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.data) {
          // localStorage에 사용자 정보 저장
          const userData = {
            id: data.data.id,
            name: data.data.name,
            email: data.data.email,
            role: data.data.role,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('수동 로그인 성공:', userData);
          
          // 역할에 따른 대시보드 이동
          const dashboardPath = data.data.role === 'socialWorker' 
            ? '/dashboard/social-worker' 
            : '/dashboard/care-worker';
          
          router.push(dashboardPath);
        }
      } else {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('수동 로그인 실패:', error);
      alert('수동 로그인에 실패했습니다. 먼저 카카오 로그인을 해주세요.');
    }
  };

  // 🔥 개발용 가짜 로그인
  const handleDevLogin = (role: 'socialWorker' | 'careWorker') => {
    const userData = {
      id: role === 'socialWorker' ? 1 : 7,
      name: role === 'socialWorker' ? '김소셜' : '오정희',
      email: role === 'socialWorker' ? 'social@test.com' : '4299374599@kakao.local',
      role: role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem('user', JSON.stringify(userData));
    console.log('개발용 로그인:', userData);
    
    const dashboardPath = role === 'socialWorker' 
      ? '/dashboard/social-worker' 
      : '/dashboard/care-worker';
    
    router.push(dashboardPath);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Oncare 로고 */}
        <div className="flex justify-center mb-16">
          <Image
            src="/Container.png"
            alt="Oncare"
            width={150}
            height={60}
            className="h-12 w-auto"
            priority
          />
        </div>

        {/* 에러 메시지 표시 */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 text-center">{errorMessage}</p>
          </div>
        )}

        {/* OAuth 로그인 버튼들 */}
        <div className="space-y-3">
          {/* 카카오 로그인 버튼 */}
          <button
            onClick={handleKakaoLogin}
            className="w-full transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Image
              src="/kakao.png"
              alt="카카오 로그인"
              width={350}
              height={56}
              className="w-full h-auto rounded-lg shadow-sm"
              priority
            />
          </button>

          {/* 개발 환경 전용 버튼들 */}
          {process.env.NODE_ENV === 'development' && (
            <>
              <div className="my-4 border-t border-gray-200 pt-4">
                <p className="text-xs text-gray-500 text-center mb-3">개발 전용</p>
                
                {/* 수동 로그인 버튼 */}
                <button
                  onClick={handleManualLogin}
                  className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 mb-2"
                >
                  🔄 수동 로그인 (쿠키 사용)
                </button>
                
                {/* 개발용 가짜 로그인 버튼들 */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDevLogin('socialWorker')}
                    className="flex-1 py-2 px-3 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors duration-200"
                  >
                    👩‍💼 소셜워커
                  </button>
                  <button
                    onClick={() => handleDevLogin('careWorker')}
                    className="flex-1 py-2 px-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm transition-colors duration-200"
                  >
                    👩‍⚕️ 요양보호사
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 하단 링크 */}
        <div className="mt-8 text-center">
          <span className="text-sm text-gray-500">
            간편 로그인이 없으신가요?{' '}
          </span>
          <Link 
            href="/login" 
            className="text-sm font-medium underline transition-colors duration-200 hover:text-primary-600"
            style={{ color: '#8AAD8A' }}
          >
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}

// 메인 페이지 컴포넌트 - Suspense로 감싸기
export default function OAuthPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        </div>
      }
    >
      <OAuthContent />
    </Suspense>
  );
}