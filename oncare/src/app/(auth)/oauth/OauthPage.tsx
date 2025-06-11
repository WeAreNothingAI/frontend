"use client"

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function OAuthPage() {
  const handleKakaoLogin = () => {
    const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
    const REDIRECT_URI = 'http://oncare-2087995465.ap-northeast-2.elb.amazonaws.com/auth/kakao/callback';
    
    if (!KAKAO_CLIENT_ID || !REDIRECT_URI) {
      alert('카카오 로그인 설정이 완료되지 않았습니다.');
      return;
    }
    
    const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    window.location.href = KAKAO_AUTH_URL;
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
            />
          </button>

          {/* 네이버 로그인 버튼 - 임시 비활성화 */}
          {/* <button
            onClick={handleNaverLogin}
            disabled
            className="w-full transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] opacity-50 cursor-not-allowed"
          >
            <Image
              src="/naver.png"
              alt="네이버 로그인"
              width={350}
              height={56}
              className="w-full h-auto rounded-lg shadow-sm"
              priority
            />
          </button> */}
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