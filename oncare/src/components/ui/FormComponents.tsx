"use client";

import React, { useState, ChangeEvent } from 'react';
import Image from 'next/image';

// 타입 정의
interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  [key: string]: string;
}

interface FormInputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  name: string;
  showPasswordToggle?: boolean;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
}

interface FormButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'outline';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

interface FormLinkProps {
  children: React.ReactNode;
  href: string;
  className?: string;
}

interface FormCardProps {
  children: React.ReactNode;
  title?: string;
}

// 기본 Input 컴포넌트 (3단계, 5단계 적용)
export const FormInput: React.FC<FormInputProps> = ({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  error, 
  disabled = false,
  name,
  showPasswordToggle = false,
  onKeyPress,
  className = '',
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;
  
  return (
    <div className="space-y-1 sm:space-y-2 md:space-y-3">
      {/* 라벨 - 5단계: 반응형 적용 */}
      {label && (
        <label className="block text-sm sm:text-base md:text-lg font-medium text-gray-800 mb-1 sm:mb-2">
          {label}
        </label>
      )}
      
      {/* 입력 필드 컨테이너 */}
      <div className="relative">
        {/* 3단계: 입력 필드 반응형 크기 조정 */}
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          onKeyPress={onKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-3 sm:px-4 md:px-5 py-2 sm:py-3 md:py-4 
            rounded-lg text-sm sm:text-base md:text-lg
            text-white placeholder-gray-600
            border-2 transition-all duration-200
            focus:outline-none focus:ring-0
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${className}
          `}
          style={{
            backgroundColor: '#8AAD8A', // 에러 상태와 관계없이 항상 같은 배경색
            borderColor: error ? '#FF7171' : '#8AAD8A' // 테두리만 에러 시 변경
          }}
          {...props}
        />
        
        {/* 5단계: 비밀번호 토글 버튼 반응형 */}
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 sm:right-3 md:right-4 top-1/2 transform -translate-y-1/2 
                       hover:opacity-80 transition-opacity duration-200 cursor-pointer"
          >
            <Image
              src="/visibility_off.png"
              alt={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
              width={20}
              height={20}
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 opacity-80"
            />
          </button>
        )}
      </div>
      
      {/* 5단계: 에러 메시지 반응형 */}
      {error && (
        <p className="text-xs sm:text-sm md:text-base font-medium mt-1 sm:mt-2" style={{ color: '#FF7171' }}>
          {error}
        </p>
      )}
    </div>
  );
};

// 제출 버튼 컴포넌트 (4단계 적용)
export const FormButton: React.FC<FormButtonProps> = ({ 
  children, 
  onClick, 
  disabled = false, 
  loading = false,
  variant = 'primary',
  className = '',
  type = 'button',
  ...props 
}) => {
  // 4단계: 버튼 반응형 크기 조정
  const baseClasses = 'w-full py-3 sm:py-4 md:py-5 px-4 sm:px-6 md:px-8 rounded-lg font-semibold text-base sm:text-lg md:text-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2';
  
  const variants = {
    primary: `
      text-white 
      hover:opacity-90 
      focus:ring-green-500
      disabled:bg-gray-400 disabled:cursor-not-allowed
      shadow-lg hover:shadow-xl
    `,
    outline: `
      border-2 border-gray-300 text-gray-700 
      hover:bg-gray-50 
      focus:ring-gray-300
    `
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      style={{
        backgroundColor: variant === 'primary' ? '#4a6d4a' : undefined
      }}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span className="text-white">처리 중...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

// 링크 버튼 컴포넌트 (5단계 적용)
export const FormLink: React.FC<FormLinkProps> = ({ children, href, className = '' }) => {
  return (
    <a 
      href={href}
      className={`text-gray-600 hover:text-gray-800 transition-colors duration-200 font-medium text-sm sm:text-base md:text-lg ${className}`}
    >
      {children}
    </a>
  );
};

// 카드 컨테이너 컴포넌트 (2단계 적용)
export const FormCard: React.FC<FormCardProps> = ({ children, title }) => {
  return (
    <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto">
      {/* 카드 */}
      <div 
        className="p-6 sm:p-8 md:p-10 lg:p-12 rounded-3xl shadow-2xl border-2"
        style={{
          backgroundColor: '#B5D692',
          borderColor: '#a8d085'
        }}
      >
        {/* 2단계: 제목을 카드 안으로 이동 + 회원가입 색상 적용 */}
        {title && (
          <h1 
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8"
            style={{ color: '#A2985E' }}
          >
            {title}
          </h1>
        )}
        {children}
      </div>
    </div>
  );
};

// 예제 사용법 (실제 사용 시에는 제거)
export default function FormComponentsDemo() {
  const [formData, setFormData] = useState<FormData>({
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
    
    // 에러 제거
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
    
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    }
    
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }
    
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (): void => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      console.log('폼 제출:', formData);
      
      // 임시 처리
      setTimeout(() => {
        setIsLoading(false);
        console.log('처리 완료');
      }, 2000);
      
    } catch (error) {
      console.error('폼 제출 에러:', error);
      setErrors({ general: '처리 중 오류가 발생했습니다.' });
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#B5D692' }}>
      <FormCard title="회원가입">
        <div className="space-y-6">
          <FormInput
            label="이름"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="이름을 입력해주세요"
            error={errors.name}
          />
          
          <FormInput
            label="아이디"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="이메일을 입력해주세요"
            error={errors.email}
          />
          
          <FormInput
            label="비밀번호"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="비밀번호를 입력해주세요"
            error={errors.password}
            showPasswordToggle={true}
          />
          
          <FormInput
            label="비밀번호 확인"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="비밀번호를 다시 한 번 입력해주세요"
            error={errors.confirmPassword}
            showPasswordToggle={true}
          />
          
          <FormButton onClick={handleSubmit} loading={isLoading}>
            확인
          </FormButton>
          
          <div className="flex items-center justify-center gap-1 text-sm sm:text-base md:text-lg">
            <span className="text-gray-600">이미 계정이 있나요?</span>
            <FormLink href="/login">로그인</FormLink>
          </div>

        </div>
      </FormCard>
    </div>
  );
}