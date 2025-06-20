// hooks/useAuth.ts - OAuth + 임시 로그인 지원 버전
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

  // JWT 토큰에서 사용자 정보 추출 (임시 토큰 지원)
  const extractUserFromToken = useCallback((token: string): User | null => {
    try {
      if (!token || !token.startsWith('eyJ')) {
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
          const tokenUser = extractUserFromToken(storedToken);
          if (tokenUser) {
            console.log('✅ 유효한 JWT 토큰 발견:', tokenUser);
            setToken(storedToken);
            setUser(tokenUser);
            setIsAuthenticated(true);
          } else {
            // 저장된 사용자 정보로 폴백 (백엔드와 싱크 맞추기 위해)
            console.log('⚠️ 토큰 검증 실패, 저장된 사용자 정보 사용:', parsedUser);
            setToken(storedToken);
            setUser(parsedUser);
            setIsAuthenticated(true);
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