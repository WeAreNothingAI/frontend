// hooks/useAuth.ts - 문제 수정 버전
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
  logout: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 쿠키에서 사용자 정보 추출 (내부 함수)
  const extractUserFromCookies = useCallback(() => {
    try {
      // 쿠키 파싱
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = value;
        return acc;
      }, {} as Record<string, string>);

      const accessToken = cookies['access_token'];
      
      if (accessToken && accessToken.startsWith('eyJ')) {
        // JWT payload 디코딩
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        
        // 토큰 만료 확인
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
          return null; // 만료된 토큰
        }

        // 사용자 정보 반환
        return {
          id: payload.sub,
          name: payload.name,
          email: payload.email,
          role: payload.role as 'careWorker' | 'socialWorker',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // JWT 디코딩 실패 시 null 반환
    }
    
    return null;
  }, []);

  // 초기화 (한 번만 실행)
  useEffect(() => {
    const initialize = () => {
      // 1. localStorage에서 먼저 확인
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          localStorage.removeItem('user');
        }
      }

      // 2. 쿠키에서 확인
      const userFromCookie = extractUserFromCookies();
      if (userFromCookie) {
        setUser(userFromCookie);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userFromCookie));
      } else {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      }
      
      setIsLoading(false);
    };

    initialize();
  }, []); // 빈 배열로 한 번만 실행

  // 로그아웃
  const logout = useCallback(async () => {
    // 클라이언트 상태 정리
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    
    // 쿠키 제거
    document.cookie = 'access_token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    document.cookie = 'refresh_token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    
    // OAuth 페이지로 이동
    router.push('/oauth');
  }, [router]);

  return {
    user,
    isLoading,
    isAuthenticated,
    logout,
  };
};