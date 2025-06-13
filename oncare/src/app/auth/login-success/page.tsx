'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginSuccessPage() {
  const router = useRouter();
  
  useEffect(() => {
    console.log('=== Login Success Page ===');
    console.log('All cookies:', document.cookie);
    
    // Parse cookies properly to avoid interference
    const cookieMap = document.cookie.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        acc[name] = value;
      }
      return acc;
    }, {} as Record<string, string>);
    
    console.log('Parsed cookies:', Object.keys(cookieMap));
    console.log('Looking for access_token...');
    
    const accessToken = cookieMap['access_token'];
    
    if (accessToken) {
      console.log('access_token found:', accessToken.substring(0, 50) + '...');
      
      try {
        // JWT decoding
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        console.log('=== JWT Payload Analysis ===');
        console.log('Full payload:', payload);
        console.log('Role field:', payload.role);
        console.log('Role type:', typeof payload.role);
        console.log('Available fields:', Object.keys(payload));
        
        // Role validation
        const validRoles = ['socialWorker', 'careWorker'];
        const isValidRole = validRoles.includes(payload.role);
        console.log('Is valid role?', isValidRole);
        
        if (!payload.role) {
          console.error('Role field is missing from JWT');
          router.push('/oauth?error=missing_role');
          return;
        }
        
        // Save to localStorage
        const userData = {
          id: payload.sub,
          name: payload.name,
          email: payload.email,
          role: payload.role,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('User info saved successfully');
        
        // Navigate to dashboard with fallback
        let dashboardPath;
        if (payload.role === 'socialWorker') {
          dashboardPath = '/dashboard/social-worker';
        } else if (payload.role === 'careWorker') {
          dashboardPath = '/dashboard/care-worker';
        } else {
          console.warn('Unknown role, defaulting to social-worker dashboard');
          dashboardPath = '/dashboard/social-worker';
        }
        
        console.log('Navigating to:', dashboardPath);
        
        setTimeout(() => {
          window.location.href = dashboardPath;
        }, 1000);
        
      } catch (error) {
        console.error('JWT decode failed:', error);
        router.push('/oauth?error=jwt_decode_failed');
      }
    } else {
      console.error('access_token not found');
      console.log('Available cookies:', Object.keys(cookieMap));
      console.log('Checking for any JWT-like tokens...');
      
      // Check for any JWT-like tokens (starting with eyJ)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const jwtTokens = Object.entries(cookieMap).filter(([name, value]) => 
        value && value.startsWith('eyJ')
      );
      
      if (jwtTokens.length > 0) {
        console.log('Found JWT-like tokens:', jwtTokens.map(([name]) => name));
        // Try the first JWT token found
        const [tokenName, tokenValue] = jwtTokens[0];
        console.log('Trying token:', tokenName);
        
        try {
          const payload = JSON.parse(atob(tokenValue.split('.')[1]));
          console.log('Alternative token payload:', payload);
          // Could continue with this token...
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          console.error('Failed to decode alternative token');
        }
      }
      
      router.push('/oauth?error=no_access_token');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Login Processing</h2>
        <p className="text-gray-600">Checking cookies...</p>
        <p className="text-sm text-gray-500">Please check console</p>
      </div>
    </div>
  );
}