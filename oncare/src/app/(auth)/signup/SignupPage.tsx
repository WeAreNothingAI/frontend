"use client";

import React, { useState, ChangeEvent } from 'react';
import Image from 'next/image';
import { FormInput, FormButton, FormCard, FormLink } from '@/components/ui/FormComponents';

// 타입 정의
interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function SignupPage() {
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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
    
    // 이름 검증
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '이름은 2자 이상 입력해주세요.';
    }
    
    // 아이디(이메일) 검증
    if (!formData.email.trim()) {
      newErrors.email = '아이디를 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }
    
    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상 입력해주세요.';
    } else if (!/^(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = '비밀번호는 영문과 숫자를 포함해야 합니다.';
    }
    
    // 비밀번호 확인 검증
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호를 다시 한 번 입력해주세요.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // TODO: 실제 회원가입 API 호출
      console.log('회원가입 데이터:', formData);
      
      // 임시: 2초 후 성공 처리
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 성공 메시지 표시 후 로그인 페이지로 이동
      alert('회원가입이 완료되었습니다!');
      window.location.href = '/login';
      
    } catch (error) {
      console.error('회원가입 에러:', error);
      setErrors({ 
        general: '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.' 
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
          onClick={() => window.location.href = '/login'}
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
        <FormCard title="회원가입">
          {/* 6단계: 간격 반응형 조정 */}
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

            {/* 이름 입력 */}
            <FormInput
              label="이름"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="이름을 입력해주세요"
              error={errors.name}
              disabled={isLoading}
            />

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

            {/* 비밀번호 확인 입력 */}
            <FormInput
              label="비밀번호 확인"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="비밀번호를 다시 한 번 입력해주세요"
              error={errors.confirmPassword}
              showPasswordToggle={true}
              disabled={isLoading}
            />

            {/* 6단계: 확인 버튼 간격 조정 */}
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

            {/* 6단계: 로그인 링크 간격 조정 */}
            <div className="text-center pt-3 sm:pt-4 md:pt-6">
              <FormLink href="/login">
                이미 계정이 있나요? 로그인
              </FormLink>
            </div>
          </div>
        </FormCard>
      </main>
    </div>
  );
}