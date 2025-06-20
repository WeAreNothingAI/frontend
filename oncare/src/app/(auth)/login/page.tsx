'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useOAuth } from '@/hooks/useOAuth';
import Image from 'next/image';
import Link from 'next/link';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, setAuthData } = useAuth();
  const { handleOAuthLogin, isLoading: oauthLoading, error } = useOAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const urlError = searchParams.get('error');

  useEffect(() => {
    if (!mounted || isLoading) return;

    if (isAuthenticated) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          console.log('👤 인증된 사용자:', user);
          
          if (user.role === 'socialWorker') {
            router.push('/dashboard/social-worker');
          } else if (user.role === 'careWorker') {
            router.push('/dashboard/care-worker');
          }
        } catch (error) {
          console.error('사용자 정보 파싱 에러:', error);
          localStorage.removeItem('user');
        }
      }
    }
  }, [isAuthenticated, isLoading, router, mounted]);

  // 🔥 임시 로그인 함수들 (바로 대시보드로 이동)
  const handleTempLogin = (role: 'socialWorker' | 'careWorker') => {
    const tempUsers = {
      socialWorker: {
        id: 1,
        name: '김사회복지사',
        email: 'social@example.com',
        role: 'socialWorker' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      careWorker: {
        id: 2,
        name: '박요양보호사',
        email: 'care@example.com',
        role: 'careWorker' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    };

    const user = tempUsers[role];
    const tempToken = `temp_jwt_token_${role}_${Date.now()}`;

    console.log('🔧 임시 로그인:', user);

    // 인증 정보 설정
    setAuthData(tempToken, user);

    // 🔥 바로 대시보드로 이동 (login-success 건너뛰기)
    if (role === 'socialWorker') {
      router.push('/dashboard/social-worker');
    } else {
      router.push('/dashboard/care-worker');
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">대시보드로 이동 중...</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="w-full flex justify-between items-center p-6">
        <div className="flex items-center">
          <Image
            src="/Container.png"
            alt="Oncare Logo"
            width={120}
            height={50}
            priority
            quality={100}
            className="h-7 w-auto"
          />
        </div>
        <div className="text-sm text-gray-600">
          요양보호 관리 시스템
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">로그인</h1>
            <p className="text-gray-600">요양보호사 또는 사회복지사만 이용 가능합니다</p>
          </div>

          {/* 에러 표시 */}
          {(urlError || error) && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {urlError === 'auth_failed' ? '인증에 실패했습니다. 다시 시도해주세요.' : urlError || error}
            </div>
          )}

          {/* 🔥 임시 로그인 버튼들 (개발용) */}
          <div className="space-y-3 mb-6">
            <div className="text-center text-sm text-gray-500 mb-3">
              🔧 개발용 임시 로그인
            </div>
            
            <button
              onClick={() => handleTempLogin('socialWorker')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              👨‍💼 사회복지사로 로그인 (개발용)
            </button>
            
            <button
              onClick={() => handleTempLogin('careWorker')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              👩‍⚕️ 요양보호사로 로그인 (개발용)
            </button>
          </div>

          {/* 구분선 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">실제 로그인</span>
            </div>
          </div>

          {/* 카카오 로그인 버튼 */}
          <button
            onClick={() => handleOAuthLogin('KAKAO')}
            disabled={oauthLoading === 'KAKAO'}
            className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-black font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mb-4"
          >
            {oauthLoading === 'KAKAO' ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                카카오 로그인 중...
              </>
            ) : (
              '카카오로 로그인'
            )}
          </button>

          {/* 이메일 로그인 링크 */}
          <Link 
            href="/oauth/kakao"
            className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center block text-center"
          >
            이메일로 로그인
          </Link>

          {/* 개발 정보 */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-3 bg-gray-50 rounded text-xs text-gray-600 space-y-1">
              <p><strong>리다이렉트 OAuth 플로우:</strong></p>
              <p>1. 카카오 → 백엔드 (/auth/kakao/callback)</p>
              <p>2. 백엔드 → 프론트엔드 (/auth/kakao?tokens...)</p>
              <p>3. 프론트엔드 → 토큰 추출 → 대시보드</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}