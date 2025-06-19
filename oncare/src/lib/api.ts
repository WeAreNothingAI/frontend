/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/api.ts - 백엔드 명세에 맞춘 완전한 API 클라이언트
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 공통 응답 타입
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

// 에러 응답 타입
interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

// 요양보호사 타입
interface CareWorker {
  id: number;
  email: string;
  name: string;
  role: 'careWorker';
  createdAt: string;
  updatedAt: string;
}

// 근무 데이터 타입
interface WorkData {
  id: number;
  memberId: number;
  workDate: string;
  createdAt: string;
  updatedAt: string;
  member: {
    id: number;
    name: string;
    email: string;
  };
  events: WorkEvent[];
}

interface WorkEvent {
  id: number;
  workId: number;
  type: 'CLOCK_IN' | 'CLOCK_OUT';
  workTime: string;
  createdAt: string;
  updatedAt: string;
}

// 클라이언트(노인) 타입
interface ClientInfo {
  clientId: number;
  clientName: string;
  attendance: boolean;
  schedule: string;
  journalStatus: string;
}

interface ClientDetail {
  id: number;
  name: string;
  birthDate: string;
  gender: string;
  planningTime?: string;
  address?: string;
  contact?: string;
  guardianContact?: string;
  careWorkerId: number;
  notes?: string;
}

// 일지 타입
interface JournalListItem {
  date: string;
  journalId: number;
  createdAt: string;
}

interface JournalDetail {
  summary: string;
  recommendations: string;
  opinion: string;
  result: string;
  note: string;
}

interface JournalSummaryResponse {
  file: string;
  docx_url: string;
  pdf_url: string;
  summary: string;
  recommendations: string;
  opinion: string;
  result: string;
  note: string;
  updated: {
    id: number;
    careWorkerId: number;
    clientId: number;
    rawAudioUrl: string;
    transcript: string;
    summary: string;
    recommendations: string;
    opinion: string;
    result: string;
    note: string;
    exportedPdf: string;
    exportedDocx: string;
    createdAt: string;
    updatedAt: string;
  };
}

// 리포트 타입
interface ReportDetail {
  file: string;
  docx_url: string;
  pdf_url: string;
  title: string;
  clientName: string;
  birthDate: string;
  careLevel: string;
  guardianContact: string;
  reportDate: string;
  socialWorkerName: string;
  summary: string;
  riskNotes: string;
  evaluation: string;
  suggestion: string;
  journalSummary: Array<{
    date: string;
    careWorker: string;
    service: string;
    notes: string;
  }>;
}

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    
    if (token) {
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    }
    
    return {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    
    // 🔥 토큰 기반 인증으로 변경
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      // credentials: 'include' 제거 (쿠키 대신 토큰 사용)
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        statusCode: response.status,
        message: `HTTP ${response.status}`,
        error: response.statusText
      }));
      
      // 401 에러 시 토큰 만료 처리
      if (response.status === 401) {
        console.log('🔐 토큰이 만료되었습니다.');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        // 필요시 로그인 페이지로 리다이렉트
        window.location.href = '/oauth';
      }
      
      throw new Error(`${errorData.statusCode}: ${errorData.message}`);
    }

    return response.json();
  }

  // 🔐 인증 관련
  async kakaoLogin(): Promise<string> {
    return this.request('/auth/kakao');
  }

  async kakaoCallback(code: string): Promise<any> {
    // 🔥 GET 방식으로 변경 (백엔드 명세에 따라)
    return this.request(`/auth/kakao/callback?code=${code}`);
  }

  async getProfile(): Promise<any> {
    // 🔥 올바른 엔드포인트 사용
    return this.request('/auth/me');
  }

  async logout(): Promise<any> {
    // 🔥 GET 방식으로 변경
    return this.request('/auth/logout');
  }

  async refreshToken(): Promise<any> {
    return this.request('/auth/refresh', { method: 'POST' });
  }

  async deleteAccount(): Promise<any> {
    return this.request('/auth/me', { method: 'DELETE' });
  }

  async completeSignup(userData: any): Promise<any> {
    return this.request('/auth/complete-signup', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  // 👥 요양보호사 관련
  async getCareWorkers(): Promise<ApiResponse<CareWorker[]>> {
    return this.request('/careworker');
  }

  // 이번 주 근무 데이터 조회 (메서드명 변경)
  async getThisWeekWorks(): Promise<ApiResponse<WorkData[]>> {
    return this.request('/careworker/works/this-week');
  }

  async getCareWorkerWorkByDateRange(
    startDate: string, 
    endDate: string
  ): Promise<ApiResponse<WorkData[]>> {
    const params = new URLSearchParams({ startDate, endDate });
    return this.request(`/careworker/works/date-range?${params.toString()}`);
  }

  // 👴 클라이언트(노인) 관련
  async getClients(): Promise<ClientInfo[]> {
    return this.request('/client');
  }

  async getClient(id: number): Promise<ClientDetail> {
    return this.request(`/client/${id}`);
  }

  async getClientJournals(clientId: number): Promise<Array<{ id: number; createdAt: string }>> {
    return this.request(`/client/${clientId}/journal`);
  }

  async updateClientCareWorker(clientId: number, careWorkerId: number): Promise<any> {
    return this.request(`/client/${clientId}/care-worker`, {
      method: 'PATCH',
      body: JSON.stringify({ careWorkerId })
    });
  }

  async createClient(clientData: {
    name: string;
    birthDate: string;
    gender: string;
    planningTime?: string;
    address?: string;
    contact?: string;
    guardianContact?: string;
    careWorkerId: number;
    notes?: string;
  }): Promise<any> {
    return this.request('/client', {
      method: 'POST',
      body: JSON.stringify(clientData)
    });
  }

  async updateClient(id: number, clientData: {
    name: string;
    birthDate: string;
    planningTime?: string;
    address?: string;
    contact?: string;
    guardianContact?: string;
    notes?: string;
  }): Promise<any> {
    return this.request(`/client/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clientData)
    });
  }

  // 📝 일지 관련
  // 기간별 일지 목록 조회 (메서드명 변경)
  async getJournalsByDateRange(params: {
    startDate?: string;
    endDate?: string;
    careWorkerId?: number;
  }): Promise<ApiResponse<JournalListItem[]>> {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.careWorkerId) queryParams.append('careWorkerId', params.careWorkerId.toString());
    
    return this.request(`/journal/list/date-range?${queryParams.toString()}`);
  }

  // 일지 상세 조회
  async getJournalSummary(id: number): Promise<JournalDetail> {
    return this.request(`/journal/${id}`);
  }

  async getJournalRawAudio(id: number): Promise<string> {
    return this.request(`/journal/${id}/raw-audio`);
  }

  async updateJournalTranscript(id: number, editedTranscript: string): Promise<any> {
    return this.request(`/journal/${id}/edit-transcript`, {
      method: 'PATCH',
      body: JSON.stringify({ editedTranscript })
    });
  }

  // 일지 요약 생성 (메서드명 변경)
  async generateJournalSummary(id: number): Promise<JournalSummaryResponse> {
    return this.request(`/journal/${id}/summary`, {
      method: 'POST'
    });
  }

  async convertJournalToPdf(id: number): Promise<{ pdf_url: string }> {
    return this.request(`/journal/${id}/convert-pdf`, {
      method: 'POST'
    });
  }

  // 일지 다운로드 URL 조회 (메서드명 변경)
  async getJournalDocxUrl(id: number): Promise<{ download_url: string }> {
    return this.request(`/journal/${id}/download-docx`, {
      method: 'POST'
    });
  }

  async getJournalPdfUrl(id: number): Promise<{ download_url: string }> {
    return this.request(`/journal/${id}/download-pdf`, {
      method: 'POST'
    });
  }

  // ⏰ 근무 관리
  async startWork(clientId: number): Promise<any> {
    return this.request('/work/start', {
      method: 'POST',
      body: JSON.stringify({ clientId })
    });
  }

  async endWork(clientId: number): Promise<any> {
    return this.request('/work/end', {
      method: 'POST',
      body: JSON.stringify({ clientId })
    });
  }

  // 📊 리포트 관련
  async getReport(id: number): Promise<ReportDetail> {
    return this.request(`/report/${id}`);
  }

  // 주간보고서 생성 (메서드명 변경)
  async createWeeklyReport(journalIds: number[]): Promise<ReportDetail[]> {
    return this.request('/report', {
      method: 'POST',
      body: JSON.stringify({ journalIds })
    });
  }

  // 보고서 다운로드 URL 조회 (메서드명 변경)
  async getReportDocxUrl(id: number): Promise<{ download_url: string }> {
    return this.request(`/report/${id}/download-docx`, {
      method: 'POST'
    });
  }

  async getReportPdfUrl(id: number): Promise<{ download_url: string }> {
    return this.request(`/report/${id}/download-pdf`, {
      method: 'POST'
    });
  }
}

export const api = new ApiClient();

// 타입들도 export
export type {
  ApiResponse,
  ApiError,
  CareWorker,
  WorkData,
  WorkEvent,
  ClientInfo,
  ClientDetail,
  JournalListItem,
  JournalDetail,
  JournalSummaryResponse,
  ReportDetail
};