// app/auth/login-success/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function LoginSuccessPage() {
  const router = useRouter();
  const { setAuthData } = useAuth();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // localStorage에서 데이터 확인
        const token = localStorage.getItem('access_token');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
          throw new Error('인증 정보가 없습니다');
        }

        const user = JSON.parse(userStr);
        console.log('🔐 인증 정보 확인:', { user, hasToken: !!token });

        // useAuth 훅에 데이터 설정
        setAuthData(token, user);

        // role에 따른 라우팅
        setTimeout(() => {
          if (user.role === 'socialWorker') {
            console.log('➡️ 사회복지사 대시보드로 이동');
            router.push('/dashboard/social-worker');
          } else if (user.role === 'careWorker') {
            console.log('➡️ 요양보호사 대시보드로 이동');
            router.push('/dashboard/care-worker');
          } else {
            throw new Error('알 수 없는 사용자 역할');
          }
        }, 1000); // 1초 대기 (사용자 경험 개선)

      } catch (error) {
        console.error('❌ 인증 초기화 실패:', error);
        router.push('/login?error=auth_failed');
      }
    };

    initializeAuth();
  }, [router, setAuthData]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">로그인 성공!</h2>
        <p className="text-gray-600 mb-4">대시보드로 이동 중입니다...</p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  );
}