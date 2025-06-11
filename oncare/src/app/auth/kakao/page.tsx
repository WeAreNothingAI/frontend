'use client'

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function KakaoAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // URL에서 정보 추출
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    
    console.log('Kakao OAuth callback:', { code, error });
    
    if (error) {
      console.error('OAuth error:', error);
      router.push('/oauth');
      return;
    }
    
    if (code) {
      // 백엔드가 이미 처리했으므로 성공 페이지로 이동
      console.log('OAuth success, redirecting...');
      // 백엔드가 쿠키를 설정했을 것
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="space-y-4 text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary-500" />
        <p className="text-gray-600">로그인 처리 중...</p>
      </div>
    </div>
  );
}