// app/auth/kakao/page.tsx - 완전한 카카오 콜백 처리
'use client'

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface AuthStep {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
}

// useSearchParams를 사용하는 컴포넌트 분리
function KakaoAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [steps, setSteps] = useState<AuthStep[]>([
    { name: '카카오 인증 확인', status: 'pending' },
    { name: '서버 로그인 처리', status: 'pending' },
    { name: '사용자 정보 조회', status: 'pending' },
    { name: '대시보드 이동', status: 'pending' }
  ]);

  const updateStep = (index: number, status: 'success' | 'error', message?: string) => {
    setSteps(prev => prev.map((step, i) => 
      i === index ? { ...step, status, message } : step
    ));
  };

  const handleAuthFlow = async (code: string) => {
    try {
      // Step 1: 카카오 인증 확인
      updateStep(0, 'success', '카카오 인증 코드 확인됨');
      
      // Step 2: 서버 로그인 처리
      console.log('🔐 서버 로그인 처리 중...');
      const authResponse = await api.kakaoCallback(code);
      console.log('서버 응답:', authResponse);
      
      if (authResponse && (authResponse.success !== false)) {
        updateStep(1, 'success', '서버 로그인 성공');
        
        // 쿠키 확인 (디버그용)
        console.log('🍪 쿠키 확인:', document.cookie);
        
        // Step 3: 사용자 정보 조회
        console.log('👤 사용자 정보 조회 중...');
        try {
          const profileResponse = await api.getProfile();
          console.log('프로필 응답:', profileResponse);
          
          if (profileResponse && profileResponse.data) {
            // localStorage에 사용자 정보 저장
            localStorage.setItem('user', JSON.stringify(profileResponse.data));
            updateStep(2, 'success', `${profileResponse.data.name}님 환영합니다!`);
            
            // Step 4: 대시보드 이동
            updateStep(3, 'success', '대시보드로 이동 중...');
            
            // 역할에 따른 대시보드 이동
            const dashboardPath = profileResponse.data.role === 'socialWorker' 
              ? '/dashboard/social-worker' 
              : '/dashboard/care-worker';
            
            setTimeout(() => router.push(dashboardPath), 1000);
          } else {
            throw new Error('사용자 정보가 없습니다');
          }
        } catch (profileError) {
          console.error('프로필 조회 실패:', profileError);
          updateStep(2, 'error', '사용자 정보 조회 실패');
          
          // 프로필 조회 실패해도 대시보드로 이동 (쿠키는 있을 수 있음)
          setTimeout(() => {
            updateStep(3, 'success', '대시보드로 이동 중...');
            router.push('/dashboard/social-worker');
          }, 1000);
        }
      } else {
        throw new Error(authResponse?.message || '서버 로그인 실패');
      }
    } catch (error) {
      console.error('인증 플로우 에러:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          updateStep(1, 'error', '인증 실패 - 다시 로그인해주세요');
          setTimeout(() => router.push('/oauth?error=unauthorized'), 2000);
        } else if (error.message.includes('400')) {
          updateStep(1, 'error', '잘못된 인증 코드입니다');
          setTimeout(() => router.push('/oauth?error=invalid_code'), 2000);
        } else {
          updateStep(1, 'error', '서버 연결 실패');
          setTimeout(() => router.push('/oauth?error=server_error'), 2000);
        }
      } else {
        updateStep(1, 'error', '알 수 없는 오류');
        setTimeout(() => router.push('/oauth?error=unknown'), 2000);
      }
    }
  };

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    
    if (error) {
      updateStep(0, 'error', `OAuth 에러: ${error}`);
      setTimeout(() => router.push(`/oauth?error=${encodeURIComponent(error)}`), 2000);
      return;
    }
    
    if (!code) {
      updateStep(0, 'error', '인증 코드가 없습니다');
      setTimeout(() => router.push('/oauth?error=no_code'), 2000);
      return;
    }

    handleAuthFlow(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router]);

  const getStepIcon = (status: AuthStep['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">카카오 로그인 처리중</h2>
            <p className="text-gray-600 text-sm mt-1">잠시만 기다려주세요</p>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center space-x-3">
                {getStepIcon(step.status)}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    step.status === 'success' ? 'text-green-700' :
                    step.status === 'error' ? 'text-red-700' : 'text-gray-600'
                  }`}>
                    {step.name}
                  </p>
                  {step.message && (
                    <p className={`text-xs ${
                      step.status === 'error' ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {step.message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500 mr-2" />
              <span className="text-blue-700 text-sm">처리 중...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 메인 컴포넌트 - Suspense로 감싸기
export default function KakaoAuthPage() {
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
      <KakaoAuthContent />
    </Suspense>
  );
}