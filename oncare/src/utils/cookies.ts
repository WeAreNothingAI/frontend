// utils/cookies.ts - localStorage 기반으로 수정된 버전

// JWT 토큰 디코딩 (여전히 필요)
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
    if (process.env.NODE_ENV === 'development') {
      console.error('JWT 디코딩 에러:', error);
    }
    return null;
  }
};

// 🔄 localStorage에서 토큰 및 사용자 정보 가져오기
export const getAuthData = () => {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('access_token');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) {
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ 인증 정보가 없습니다');
    }
    return null;
  }
  
  try {
    const user = JSON.parse(userStr);
    const decodedToken = decodeJWT(token);
    
    // 토큰 만료 확인
    if (decodedToken?.exp) {
      const now = Math.floor(Date.now() / 1000);
      if (decodedToken.exp < now) {
        if (process.env.NODE_ENV === 'development') {
          console.log('❌ 토큰이 만료되었습니다');
        }
        return null;
      }
    }
    
    return {
      token,
      user,
      decodedToken
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('인증 데이터 파싱 에러:', error);
    }
    return null;
  }
};

// 🔄 인증 정보 저장
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setAuthData = (token: string, user: any) => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('access_token', token);
  localStorage.setItem('user', JSON.stringify(user));
  
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ 인증 정보 저장 완료');
  }
};

// 🔄 인증 정보 삭제
export const clearAuthData = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🗑️ 인증 정보 삭제 완료');
  }
};

// 🔥 디버깅 전용 함수 (개발 환경에서만)
export const debugAuth = () => {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return;
  
  console.log('🔐 현재 인증 상태:');
  console.log('Access Token:', localStorage.getItem('access_token'));
  console.log('Refresh Token:', localStorage.getItem('refresh_token'));
  console.log('User:', localStorage.getItem('user'));
  
  const authData = getAuthData();
  if (authData) {
    console.log('✅ 인증 유효:', authData.user);
    console.log('토큰 만료:', new Date(authData.decodedToken.exp * 1000).toLocaleString());
  } else {
    console.log('❌ 인증 없음 또는 만료');
  }
};

// 🗑️ 더 이상 필요없는 쿠키 관련 함수들은 제거
// - getCookie (localStorage 사용)
// - setCookie (localStorage 사용)
// - deleteCookie (localStorage 사용)
// - getUserFromToken (getAuthData로 대체)
// - debugCookies (debugAuth로 대체)