'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginSuccessPage() {
  const router = useRouter();
  
  useEffect(() => {
    // 로그인 성공 후 처리
    // 백엔드가 쿠키를 설정했으므로 사용자 정보 확인
    const checkAuth = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
          }
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
      }
      
      // 대시보드로 이동
      router.push('/dashboard/social-worker');
    };
    
    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-gray-600">로그인 성공! 대시보드로 이동 중...</p>
      </div>
    </div>
  );
}