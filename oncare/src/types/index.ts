// 사용자 타입
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'social_worker' | 'care_worker';
  department?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 문서 타입
export interface Document {
  id: string;
  title: string;
  content: string;
  type: 'report' | 'assessment' | 'care_plan';
  uploadedBy: string;
  processedByAI: boolean;
  aiSummary?: string;
  createdAt: Date;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}