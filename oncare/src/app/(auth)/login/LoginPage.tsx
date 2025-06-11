"use client";

import React, { useState, ChangeEvent } from 'react';
import Image from 'next/image';
import { FormInput, FormButton, FormCard, FormLink } from '@/components/ui/FormComponents';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// 타입 정의
interface LoginFormData {
  email: string;
  password: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 입력 시 해당 필드의 에러 제거
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // 아이디(이메일) 검증
    if (!formData.email.trim()) {
      newErrors.email = '아이디를 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }
    
    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({}); // 기존 에러 초기화
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 쿠키 포함
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // 로그인 성공
        // 쿠키는 백엔드가 자동으로 설정
        
        // 필요시 localStorage에 토큰 저장 (STT용)
        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
        }
        
        // 사용자 정보 저장
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        alert('로그인이 완료되었습니다!');
        
        // 역할에 따라 다른 페이지로 이동
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        alert('로그인이 완료되었습니다!');
        
        // 일단 social-worker 대시보드로만 이동
        router.push('/dashboard/social-worker');
        
        // TODO: 나중에 역할별 라우팅 구현
        // if (data.user?.role === 'social_worker') {
        //   router.push('/dashboard/social-worker');
        // } else if (data.user?.role === 'caregiver') {
        //   router.push('/dashboard/caregiver');
        // } else {
        //   router.push('/dashboard');
        // }
      } else {
        // 로그인 실패
        if (data.message?.includes('아이디')) {
          setErrors({ email: data.message });
        } else if (data.message?.includes('비밀번호')) {
          setErrors({ password: data.message });
        } else {
          setErrors({ general: data.message || '로그인에 실패했습니다.' });
        }
      }
    } catch (error) {
      console.error('로그인 에러:', error);
      setErrors({ 
        general: '서버 연결 오류가 발생했습니다. 다시 시도해주세요.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 상단 헤더 */}
      <header className="w-full flex justify-between items-center p-6">
        {/* 로고 */}
        <Link href="/oauth" className="flex items-center">
          <Image
            src="/Container.png"
            alt="Oncare Logo"
            width={120}
            height={50}
            priority
            quality={100}
            className="h-7 w-auto cursor-pointer hover:opacity-80 transition-opacity"
          />
        </Link>

        {/* 로그인/회원가입 버튼 */}
        <button
          onClick={() => router.push('/signup')}
          className="transition-transform duration-200 hover:scale-105"
          disabled={isLoading}
        >
          <Image 
            src="/LoginButton.png"
            alt="로그인/회원가입"
            width={100}
            height={34}
            priority
            quality={100}
            className="h-8 w-auto object-contain"
          />
        </button>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 flex items-center justify-center p-4">
        <FormCard title="로그인">
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* 일반 에러 메시지 */}
            {errors.general && (
              <div 
                className="p-4 border-2 rounded-lg"
                style={{
                  backgroundColor: '#ffe3e3',
                  borderColor: '#FF7171'
                }}
              >
                <p className="text-sm font-medium text-center" style={{ color: '#FF7171' }}>
                  {errors.general}
                </p>
              </div>
            )}

            {/* 아이디(이메일) 입력 */}
            <FormInput
              label="아이디"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="이메일을 입력해주세요"
              error={errors.email}
              disabled={isLoading}
            />

            {/* 비밀번호 입력 */}
            <FormInput
              label="비밀번호"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="비밀번호를 입력해주세요"
              error={errors.password}
              showPasswordToggle={true}
              disabled={isLoading}
            />

            {/* 확인 버튼 */}
            <div className="pt-3 sm:pt-4 md:pt-6">
              <FormButton 
                onClick={handleSubmit}
                loading={isLoading}
                disabled={isLoading}
                variant="primary"
              >
                확인
              </FormButton>
            </div>

            {/* 회원가입 링크 */}
            <div className="text-center pt-3 sm:pt-4 md:pt-6">
              <div className="flex items-center justify-center gap-1 text-sm sm:text-base md:text-lg">
                <span className="text-gray-600">회원가입이 필요하신가요?</span>
                <FormLink href="/signup">회원가입</FormLink>
              </div>
            </div>

            {/* OAuth 로그인 링크 */}
            <div className="text-center">
              <div className="relative">
              </div>
              <div className="mt-4">
                <Link 
                  href="/oauth" 
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium underline"
                >
                  소셜 로그인으로 계속하기
                </Link>
              </div>
            </div>
          </div>
        </FormCard>
      </main>
    </div>
  );
}