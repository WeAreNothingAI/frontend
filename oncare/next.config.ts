import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 백엔드 API 프록시 설정 (필수)
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'http://localhost:3001/api/:path*', // NestJS 백엔드 주소
      },
    ]
  },
}

export default nextConfig