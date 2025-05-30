"use client";

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // 페이지 로드 시 바로 로그인 페이지로 리다이렉트
    window.location.href = '/login';
  }, []);

  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">로그인 페이지로 이동 중...</p>
      </div>
    </div>
  );
}