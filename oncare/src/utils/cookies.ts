// utils/cookies.ts - 개선된 버전
export const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue || null;
  }
  
  return null;
};

export const setCookie = (name: string, value: string, days: number = 7): void => {
  if (typeof window === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

export const deleteCookie = (name: string): void => {
  if (typeof window === 'undefined') return;
  
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// JWT 토큰 디코딩
export const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    // 운영 환경에서는 로그 최소화
    if (process.env.NODE_ENV === 'development') {
      console.error('JWT 디코딩 에러:', error);
    }
    return null;
  }
};

// 🔥 실제 백엔드 쿠키 이름에 맞춘 토큰 추출
export const getUserFromToken = () => {
  // 개발 환경에서만 디버깅 로그
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 쿠키에서 토큰 찾는 중...');
    console.log('전체 쿠키:', document.cookie);
  }
  
  // 🔥 실제 백엔드에서 사용하는 쿠키 이름들
  const tokenNames = ['access_token', 'refresh_token'];
  
  let token = null;
  let tokenName = '';
  
  // access_token 우선 시도
  for (const name of tokenNames) {
    const foundToken = getCookie(name);
    if (foundToken && foundToken.startsWith('eyJ')) { // JWT 형식 확인
      token = foundToken;
      tokenName = name;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ ${name} 토큰 발견`);
      }
      break;
    }
  }
  
  if (!token) {
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ 유효한 JWT 토큰을 찾을 수 없습니다');
    }
    return null;
  }
  
  const decoded = decodeJWT(token);
  if (!decoded) {
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ JWT 디코딩 실패');
    }
    return null;
  }
  
  // 토큰 만료 확인
  const now = Math.floor(Date.now() / 1000);
  if (decoded.exp && decoded.exp < now) {
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ 토큰이 만료되었습니다');
      console.log('만료시간:', new Date(decoded.exp * 1000).toLocaleString());
    }
    return null;
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ 유효한 토큰:', {
      tokenName,
      user: decoded.name,
      role: decoded.role,
      expires: new Date(decoded.exp * 1000).toLocaleString()
    });
  }
  
  return {
    id: decoded.sub,
    email: decoded.email,
    name: decoded.name,
    role: decoded.role,
    exp: decoded.exp,
    iat: decoded.iat,
    tokenName
  };
};

// 🔥 디버깅 전용 함수 (개발 환경에서만)
export const debugCookies = () => {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return;
  
  console.log('🍪 현재 모든 쿠키:', document.cookie);
  
  const cookies = document.cookie.split(';').map(cookie => {
    const [name, value] = cookie.trim().split('=');
    return { name, value: value?.substring(0, 50) + '...' };
  });
  
  console.table(cookies);
};