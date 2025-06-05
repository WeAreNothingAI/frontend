"use client"

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function OAuthPage() {

  const handleKakaoLogin = () => {
    // 카카오 OAuth 로그인
    const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
    const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI;
    const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    
    window.location.href = KAKAO_AUTH_URL;
  };

  const handleNaverLogin = () => {
    // 네이버 OAuth 로그인
    const NAVER_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
    const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI;
    const STATE = Math.random().toString(36).substring(2); // CSRF 방지용 랜덤 문자열
    const NAVER_AUTH_URL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${STATE}`;
    
    // state 값을 sessionStorage에 저장 (콜백에서 검증용)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('oauth_state', STATE);
    }
    
    window.location.href = NAVER_AUTH_URL;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Oncare 로고 */}
        <div className="flex justify-center mb-16">
          <Image
            src="/Container.png"
            alt="Oncare"
            width={150}
            height={60}
            className="h-12 w-auto"
            priority
            quality={100}
          />
        </div>

        {/* OAuth 로그인 버튼들 */}
        <div className="space-y-3">
          {/* 카카오 로그인 버튼 */}
          <button
            onClick={handleKakaoLogin}
            className="w-full transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Image
              src="/kakao.png"
              alt="카카오 로그인"
              width={350}
              height={56}
              className="w-full h-auto rounded-lg shadow-sm"
              priority
              quality={100}
            />
          </button>

          {/* 네이버 로그인 버튼 */}
          <button
            onClick={handleNaverLogin}
            className="w-full transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Image
              src="/naver.png"
              alt="네이버 로그인"
              width={350}
              height={56}
              className="w-full h-auto rounded-lg shadow-sm"
              priority
              quality={100}
            />
          </button>
        </div>

        {/* 하단 링크 */}
        <div className="mt-8 text-center">
          <span className="text-sm text-gray-500">
            간편 로그인이 없으신가요?{' '}
          </span>
          <Link 
            href="/login" 
            className="text-sm font-medium underline transition-colors duration-200 hover:text-primary-600"
            style={{ color: '#8AAD8A' }}
          >
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}