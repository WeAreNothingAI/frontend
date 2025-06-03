"use client";

import React, { useState, ChangeEvent } from 'react';
import Image from 'next/image';
import { FormInput, FormButton, FormCard, FormLink } from '@/components/ui/FormComponents';

// 타입 정의
interface LoginFormData {
  email: string;
  password: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function LoginPage() {
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

  const simulateLogin = async (): Promise<{ success: boolean; error?: string }> => {
    // TODO: 실제 로그인 API 호출 대신 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 임시 로그인 검증 로직
    const validEmail = 'test@example.com';
    const validPassword = 'password123';
    
    if (formData.email !== validEmail) {
      return { success: false, error: '존재하지 않는 아이디입니다.' };
    }
    
    if (formData.password !== validPassword) {
      return { success: false, error: '비밀번호가 아이디와 일치하지 않습니다.' };
    }
    
    return { success: true };
  };
  
  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({}); // 기존 에러 초기화
    
    try {
      const result = await simulateLogin();
      
      if (result.success) {
        // 성공 시 대시보드로 이동
        alert('로그인이 완료되었습니다!');
        window.location.href = '/dashboard/social-worker';
      } else {
        // 실패 시 서버 에러 메시지 표시
        if (result.error === '존재하지 않는 아이디입니다.') {
          setErrors({ email: result.error });
        } else if (result.error === '비밀번호가 아이디와 일치하지 않습니다.') {
          setErrors({ password: result.error });
        } else {
          setErrors({ general: result.error || '로그인에 실패했습니다.' });
        }
      }
      
    } catch (error) {
      console.error('로그인 에러:', error);
      setErrors({ 
        general: '로그인 중 오류가 발생했습니다. 다시 시도해주세요.' 
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
        <div className="flex items-center">
          <Image 
            src="/Container.png" 
            alt="Oncare Logo" 
            width={120} 
            height={40}
            priority
            className="h-8 w-auto"
          />
        </div>

        {/* 로그인/회원가입 버튼 */}
        <button
          onClick={() => window.location.href = '/signup'}
          className="transition-transform duration-200 hover:scale-105"
          disabled={isLoading}
        >
          <Image 
            src="/LoginButton.png"
            alt="로그인/회원가입"
            width={100}
            height={34}
            priority
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
                  backgroundColor: '#8AAD8A',
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
          </div>
        </FormCard>
      </main>
    </div>
  );
}