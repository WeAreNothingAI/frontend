'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';

function LoginContent() {
  const router = useRouter();
  const { isAuthenticated, isLoading, setAuthData } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 기존 인증 확인 및 자동 리다이렉트
  useEffect(() => {
    if (!mounted || isLoading) return;

    if (isAuthenticated) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          console.log('👤 기존 인증된 사용자:', user);
          
          // 역할별 대시보드로 자동 이동
          if (user.role === 'socialWorker') {
            router.push('/dashboard/social-worker');
          } else if (user.role === 'careWorker') {
            router.push('/dashboard/care-worker');
          }
        } catch (error) {
          console.error('사용자 정보 파싱 에러:', error);
          // 손상된 데이터 정리
          localStorage.removeItem('user');
          localStorage.removeItem('access_token');
        }
      }
    }
  }, [isAuthenticated, isLoading, router, mounted]);

  // 임시 로그인 함수
  const handleTempLogin = (role: 'socialWorker' | 'careWorker') => {
    const tempUsers = {
      socialWorker: {
        id: 1,
        name: '김사회복지사',
        email: 'social@example.com',
        role: 'socialWorker' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      careWorker: {
        id: 2,
        name: '박요양보호사',
        email: 'care@example.com',
        role: 'careWorker' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };

    const user = tempUsers[role];
    
    // 간단한 임시 토큰 생성 (btoa 에러 방지)
    const tempToken = `temp_jwt_token_${role}_${Date.now()}_${user.id}`;

    console.log('🔧 임시 로그인 수행:', user);

    // 인증 데이터 설정
    setAuthData(tempToken, user);

    // 역할별 대시보드로 즉시 이동
    if (role === 'socialWorker') {
      console.log('➡️ 사회복지사 대시보드로 이동');
      router.push('/dashboard/social-worker');
    } else {
      console.log('➡️ 요양보호사 대시보드로 이동');
      router.push('/dashboard/care-worker');
    }
  };

  // 로그아웃 함수
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    console.log('🚪 로그아웃 완료');
    window.location.reload(); // 페이지 새로고침으로 상태 초기화
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
          <h2 className="text-xl font-bold mb-4">이미 로그인되어 있습니다</h2>
          <div className="space-y-3">
            <p className="text-gray-600">대시보드로 이동 중...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <button
              onClick={handleLogout}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 헤더 */}
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

      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">온케어 로그인</h1>
            <p className="text-gray-600">요양보호사 또는 사회복지사용 시스템</p>
          </div>

          {/* 개발용 안내 */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-700">개발용 임시 로그인</span>
            </div>
            <p className="text-xs text-blue-600">
              OAuth 연동 완료 전까지 임시 로그인으로 기능 테스트가 가능합니다.
            </p>
          </div>

          {/* 임시 로그인 버튼들 */}
          <div className="space-y-4">
            <button
              onClick={() => handleTempLogin('socialWorker')}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-3 shadow-md hover:shadow-lg"
            >
              <div className="text-2xl">👨‍💼</div>
              <div className="text-left">
                <div className="font-semibold">사회복지사로 로그인</div>
                <div className="text-sm opacity-90">관리자 대시보드</div>
              </div>
            </button>
            
            <button
              onClick={() => handleTempLogin('careWorker')}
              className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-medium py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-3 shadow-md hover:shadow-lg"
            >
              <div className="text-2xl">👩‍⚕️</div>
              <div className="text-left">
                <div className="font-semibold">요양보호사로 로그인</div>
                <div className="text-sm opacity-90">일지 작성 및 관리</div>
              </div>
            </button>
          </div>

          {/* 구분선 */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500">추후 추가 예정</span>
            </div>
          </div>

          {/* 비활성화된 OAuth 버튼들 */}
          <div className="space-y-3 opacity-50">
            <button
              disabled
              className="w-full bg-yellow-400 text-black font-medium py-3 px-4 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
            >
              🥇 카카오로 로그인 (준비 중)
            </button>
            
            <button
              disabled
              className="w-full bg-gray-300 text-gray-600 font-medium py-3 px-4 rounded-lg cursor-not-allowed"
            >
              📧 이메일로 로그인 (준비 중)
            </button>
          </div>

          {/* 개발 정보 */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-3 bg-gray-50 rounded text-xs text-gray-600 space-y-1">
              <p><strong>개발 모드 정보:</strong></p>
              <p>• 임시 토큰은 24시간 후 만료됩니다</p>
              <p>• localStorage에 인증 정보가 저장됩니다</p>
              <p>• 브라우저 새로고침 시에도 로그인 상태 유지</p>
            </div>
          )}
        </div>
      </main>

      {/* 푸터 */}
      <footer className="p-4 text-center text-xs text-gray-400">
        <p>Oncare - 요양보호 관리 시스템 (개발 버전)</p>
      </footer>
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

// 이 코드를 기존 /app/login/page.tsx 파일에 덮어쓰기 하세요!






// 'use client';

// import { useEffect, useState, Suspense } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { useAuth } from '@/hooks/useAuth';
// import { useOAuth } from '@/hooks/useOAuth';
// import Image from 'next/image';
// import Link from 'next/link';

// function LoginContent() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { isAuthenticated, isLoading } = useAuth();
//   const { handleOAuthLogin, isLoading: oauthLoading, error } = useOAuth();
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   const urlError = searchParams.get('error');

//   useEffect(() => {
//     if (!mounted || isLoading) return;

//     if (isAuthenticated) {
//       const userStr = localStorage.getItem('user');
//       if (userStr) {
//         try {
//           const user = JSON.parse(userStr);
//           console.log('👤 인증된 사용자:', user);
          
//           if (user.role === 'socialWorker') {
//             router.push('/dashboard/social-worker');
//           } else if (user.role === 'careWorker') {
//             router.push('/dashboard/care-worker');
//           }
//         } catch (error) {
//           console.error('사용자 정보 파싱 에러:', error);
//           localStorage.removeItem('user');
//         }
//       }
//     }
//   }, [isAuthenticated, isLoading, router, mounted]);

//   if (!mounted || isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
//       </div>
//     );
//   }

//   if (isAuthenticated) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <h2 className="text-xl font-bold mb-4">대시보드로 이동 중...</h2>
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white flex flex-col">
//       <header className="w-full flex justify-between items-center p-6">
//         <div className="flex items-center">
//           <Image
//             src="/Container.png"
//             alt="Oncare Logo"
//             width={120}
//             height={50}
//             priority
//             quality={100}
//             className="h-7 w-auto"
//           />
//         </div>
//         <div className="text-sm text-gray-600">
//           요양보호 관리 시스템
//         </div>
//       </header>

//       <main className="flex-1 flex items-center justify-center p-4">
//         <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border">
//           <div className="text-center mb-8">
//             <h1 className="text-2xl font-bold text-gray-800 mb-2">로그인</h1>
//             <p className="text-gray-600">요양보호사 또는 사회복지사만 이용 가능합니다</p>
//           </div>

//           {/* 에러 표시 */}
//           {(urlError || error) && (
//             <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
//               {urlError === 'auth_failed' ? '인증에 실패했습니다. 다시 시도해주세요.' : urlError || error}
//             </div>
//           )}

//           {/* 카카오 로그인 버튼 */}
//           <button
//             onClick={() => handleOAuthLogin('KAKAO')}
//             disabled={oauthLoading === 'KAKAO'}
//             className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-black font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mb-4"
//           >
//             {oauthLoading === 'KAKAO' ? (
//               <>
//                 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
//                 카카오 로그인 중...
//               </>
//             ) : (
//               '카카오로 로그인'
//             )}
//           </button>

//           {/* 구분선 */}
//           <div className="relative my-6">
//             <div className="absolute inset-0 flex items-center">
//               <div className="w-full border-t border-gray-300"></div>
//             </div>
//             <div className="relative flex justify-center text-sm">
//               <span className="px-2 bg-white text-gray-500">또는</span>
//             </div>
//           </div>

//           {/* 이메일 로그인 링크 */}
//           <Link 
//             href="/auth/login"
//             className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center block text-center"
//           >
//             이메일로 로그인
//           </Link>
//         </div>
//       </main>
//     </div>
//   );
// }

// export default function LoginPage() {
//   return (
//     <Suspense fallback={
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
//       </div>
//     }>
//       <LoginContent />
//     </Suspense>
//   );
// }

