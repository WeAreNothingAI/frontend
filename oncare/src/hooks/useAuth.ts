// hooks/useAuth.ts - 임시 로그인 최적화 버전
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'careWorker' | 'socialWorker';
  createdAt?: string;
  updatedAt?: string;
}

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  logout: () => Promise<void>;
  setAuthData: (token: string, user: User) => void;
}

export const useAuth = (): UseAuthReturn => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // JWT 토큰에서 사용자 정보 추출 (임시 토큰 포함)
  const extractUserFromToken = useCallback((token: string): User | null => {
    try {
      // 임시 토큰인지 확인
      if (token.startsWith('temp_jwt_token_')) {
        console.log('🔧 임시 토큰 감지');
        return null; // 임시 토큰은 localStorage의 user 정보 사용
      }

      if (!token || !token.includes('.')) {
        return null;
      }

      // JWT payload 디코딩
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // 토큰 만료 확인
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        console.log('⏰ 토큰이 만료되었습니다');
        return null;
      }

      // 사용자 정보 반환
      return {
        id: payload.sub || payload.id,
        name: payload.name,
        email: payload.email,
        role: payload.role as 'careWorker' | 'socialWorker',
        createdAt: payload.iat ? new Date(payload.iat * 1000).toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('JWT 디코딩 실패:', error);
      return null;
    }
  }, []);

  // 인증 데이터 설정 (로그인 성공 시 호출)
  const setAuthData = useCallback((newToken: string, userData: User) => {
    console.log('🔐 인증 데이터 설정:', { 
      tokenType: newToken.startsWith('temp_') ? '임시' : '실제',
      user: userData.name,
      role: userData.role
    });
    
    // 상태 업데이트
    setToken(newToken);
    setUser(userData);
    setIsAuthenticated(true);
    
    // localStorage에 저장
    localStorage.setItem('access_token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    console.log('✅ 로그인 완료:', userData);
  }, []);

  // 초기화 (페이지 로드 시)
  useEffect(() => {
    const initialize = () => {
      console.log('🔍 인증 상태 초기화 중...');
      
      // localStorage에서 토큰과 사용자 정보 확인
      const storedToken = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          // 임시 토큰인 경우
          if (storedToken.startsWith('temp_jwt_token_')) {
            console.log('🔧 임시 로그인 상태 복원:', parsedUser);
            setToken(storedToken);
            setUser(parsedUser);
            setIsAuthenticated(true);
          } else {
            // 실제 JWT 토큰 검증
            const tokenUser = extractUserFromToken(storedToken);
            
            if (tokenUser) {
              console.log('✅ 유효한 JWT 토큰 발견:', tokenUser);
              setToken(storedToken);
              setUser(tokenUser);
              setIsAuthenticated(true);
            } else {
              // 만료되거나 유효하지 않은 토큰
              console.log('❌ 토큰이 만료되었거나 유효하지 않음');
              localStorage.removeItem('access_token');
              localStorage.removeItem('user');
              setToken(null);
              setUser(null);
              setIsAuthenticated(false);
            }
          }
        } catch (error) {
          console.error('저장된 데이터 파싱 실패:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        console.log('🔍 저장된 인증 정보 없음');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };

    initialize();
  }, [extractUserFromToken]);

  // 로그아웃
  const logout = useCallback(async () => {
    console.log('🚪 로그아웃 처리 중...');
    
    // 실제 토큰인 경우에만 백엔드에 로그아웃 요청
    if (token && !token.startsWith('temp_')) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('로그아웃 API 에러:', error);
        // 에러가 나도 클라이언트 상태는 정리
      }
    }
    
    // 클라이언트 상태 정리
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    console.log('✅ 로그아웃 완료');
    
    // 로그인 페이지로 이동
    router.push('/login');
  }, [token, router]);

  return {
    user,
    isLoading,
    isAuthenticated,
    token,
    logout,
    setAuthData,
  };
};









// hooks/useAuth.ts - 토큰 기반 인증 버전
// import { useState, useEffect, useCallback } from 'react';
// import { useRouter } from 'next/navigation';

// interface User {
//   id: number;
//   name: string;
//   email: string;
//   role: 'careWorker' | 'socialWorker';
//   createdAt?: string;
//   updatedAt?: string;
// }

// interface UseAuthReturn {
//   user: User | null;
//   isLoading: boolean;
//   isAuthenticated: boolean;
//   token: string | null;
//   logout: () => Promise<void>;
//   setAuthData: (token: string, user: User) => void;
// }

// export const useAuth = (): UseAuthReturn => {
//   const router = useRouter();
//   const [user, setUser] = useState<User | null>(null);
//   const [token, setToken] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   // JWT 토큰에서 사용자 정보 추출
//   const extractUserFromToken = useCallback((token: string): User | null => {
//     try {
//       if (!token || !token.startsWith('eyJ')) {
//         return null;
//       }

//       // JWT payload 디코딩
//       const payload = JSON.parse(atob(token.split('.')[1]));
      
//       // 토큰 만료 확인
//       const now = Math.floor(Date.now() / 1000);
//       if (payload.exp && payload.exp < now) {
//         console.log('토큰이 만료되었습니다');
//         return null;
//       }

//       // 사용자 정보 반환
//       return {
//         id: payload.sub || payload.id,
//         name: payload.name,
//         email: payload.email,
//         role: payload.role as 'careWorker' | 'socialWorker',
//         createdAt: payload.iat ? new Date(payload.iat * 1000).toISOString() : new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//       };
//     } catch (error) {
//       console.error('JWT 디코딩 실패:', error);
//       return null;
//     }
//   }, []);

//   // 인증 데이터 설정 (로그인 성공 시 호출)
//   const setAuthData = useCallback((newToken: string, userData: User) => {
//     console.log('🔐 인증 데이터 설정:', { token: newToken.substring(0, 20) + '...', user: userData });
    
//     // 상태 업데이트
//     setToken(newToken);
//     setUser(userData);
//     setIsAuthenticated(true);
    
//     // localStorage에 저장
//     localStorage.setItem('access_token', newToken);
//     localStorage.setItem('user', JSON.stringify(userData));
//   }, []);

//   // 초기화 (페이지 로드 시)
//   useEffect(() => {
//     const initialize = () => {
//       console.log('🔍 인증 상태 초기화 중...');
      
//       // localStorage에서 토큰과 사용자 정보 확인
//       const storedToken = localStorage.getItem('access_token');
//       const storedUser = localStorage.getItem('user');
      
//       if (storedToken && storedUser) {
//         try {
//           // 저장된 사용자 정보 파싱
         
          
//           // 토큰에서 사용자 정보 추출하여 검증
//           const tokenUser = extractUserFromToken(storedToken);
          
//           if (tokenUser) {
//             console.log('✅ 유효한 토큰 발견:', tokenUser);
//             setToken(storedToken);
//             setUser(tokenUser);
//             setIsAuthenticated(true);
//           } else {
//             console.log('❌ 토큰이 만료되었거나 유효하지 않음');
//             // 만료된 토큰 정리
//             localStorage.removeItem('access_token');
//             localStorage.removeItem('user');
//             setToken(null);
//             setUser(null);
//             setIsAuthenticated(false);
//           }
//         } catch (error) {
//           console.error('저장된 데이터 파싱 실패:', error);
//           localStorage.removeItem('access_token');
//           localStorage.removeItem('user');
//           setToken(null);
//           setUser(null);
//           setIsAuthenticated(false);
//         }
//       } else {
//         console.log('🔍 저장된 인증 정보 없음');
//         setToken(null);
//         setUser(null);
//         setIsAuthenticated(false);
//       }
      
//       setIsLoading(false);
//     };

//     initialize();
//   }, [extractUserFromToken]);

//   // 로그아웃
//   const logout = useCallback(async () => {
//     console.log('🚪 로그아웃 처리 중...');
    
//     try {
//       // 백엔드에 로그아웃 요청 (선택사항)
//       if (token) {
//         await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
//           method: 'POST',
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         });
//       }
//     } catch (error) {
//       console.error('로그아웃 API 에러:', error);
//       // 에러가 나도 클라이언트 상태는 정리
//     }
    
//     // 클라이언트 상태 정리
//     setUser(null);
//     setToken(null);
//     setIsAuthenticated(false);
//     localStorage.removeItem('access_token');
//     localStorage.removeItem('user');
    
//     // OAuth 페이지로 이동
//     router.push('/oauth');
//   }, [token, router]);

//   return {
//     user,
//     isLoading,
//     isAuthenticated,
//     token,
//     logout,
//     setAuthData,
//   };
// };