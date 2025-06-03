import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary 색상 시스템
        primary: {
          50: '#f0f9f0',
          100: '#B5D692',  // 연한 초록 - 메인 색상
          200: '#a8d085',
          300: '#9bc978',
          400: '#8ec16b',
          500: '#8AAD8A',  // 중간 초록 - 기본 색상
          600: '#7a9d7a',
          700: '#6a8d6a',
          800: '#5a7d5a',
          900: '#4a6d4a',
          950: '#3a5d3a',
        },
        
        // Secondary/Accent 색상
        secondary: {
          50: '#fff5f5',
          100: '#ffe3e3',
          200: '#ffc9c9',
          300: '#ffaaaa',
          400: '#ff8b8b',
          500: '#FF7171',  // 연한 빨강 - 포인트 색상
          600: '#e66464',
          700: '#cc5757',
          800: '#b34a4a',
          900: '#993d3d',
          950: '#803030',
        },

        // 에어비앤비 스타일 중성 색상
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },

        // 상태 색상들
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
        },

        // 배경 색상
        background: {
          primary: '#ffffff',
          secondary: '#f9fafb',
          tertiary: '#f3f4f6',
        },

        // 테두리 색상
        border: {
          light: 'rgba(110, 80, 73, 0.2)',    // #6E5049 20% opacity
          default: 'rgba(110, 80, 73, 0.2)',  // #6E5049 20% opacity  
          dark: 'rgba(110, 80, 73, 0.3)',     // 조금 더 진한 버전 (옵션)
          // 또는 hex + opacity 방식
          base: '#6E5049',  // 기본 색상 (opacity는 클래스로 조절)
        },

        // 텍스트 색상
        text: {
          primary: '#111827',
          secondary: '#374151',
          tertiary: '#6b7280',
          inverse: '#ffffff',
        },
      },

      // 에어비앤비 스타일 그림자
      boxShadow: {
        'airbnb': '0 2px 16px rgba(0, 0, 0, 0.12)',
        'airbnb-hover': '0 6px 20px rgba(0, 0, 0, 0.15)',
        'airbnb-card': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        'airbnb-card-hover': '0 4px 12px rgba(0, 0, 0, 0.15)',
      },

      // 에어비앤비 스타일 둥근 모서리
      borderRadius: {
        'airbnb': '12px',
        'airbnb-card': '16px',
        'airbnb-button': '8px',
      },

      // 폰트 패�리 (에어비앤비 스타일)
      fontFamily: {
        sans: [
          'Inter', 
          '-apple-system', 
          'BlinkMacSystemFont', 
          'Segoe UI', 
          'Roboto', 
          'sans-serif'
        ],
      },

      // 애니메이션
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-in-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
          '40%, 43%': { transform: 'translate3d(0,-5px,0)' },
          '70%': { transform: 'translate3d(0,-3px,0)' },
          '90%': { transform: 'translate3d(0,-1px,0)' },
        },
      },

      // 간격 (에어비앤비 디자인 시스템)
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
};

export default config;