'use client';

import { useAuth } from '@/hooks/useAuth';
import { LogOut, User } from 'lucide-react';
import { useState } from 'react';

export default function LogoutButton() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('로그아웃 에러:', error);
      setIsLoggingOut(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      {/* 사용자 정보 */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <User className="w-4 h-4" />
        <span className="font-medium">{user.name}</span>
        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
          {user.role === 'socialWorker' ? '사회복지사' : '요양보호사'}
        </span>
      </div>

      {/* 로그아웃 버튼 */}
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50"
        title="로그아웃"
      >
        {isLoggingOut ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
            <span>로그아웃 중...</span>
          </>
        ) : (
          <>
            <LogOut className="w-4 h-4" />
            <span>로그아웃</span>
          </>
        )}
      </button>
    </div>
  );
}