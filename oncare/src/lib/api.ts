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
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // 🔥 쿠키 자동 포함 (중요!)
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        statusCode: response.status,
        message: `HTTP ${response.status}`,
        error: response.statusText
      }));
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

  async getCareWorkerWorkThisWeek(): Promise<ApiResponse<WorkData[]>> {
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
  async getJournals(
    startDate?: string, 
    endDate?: string, 
    careWorkerId?: number
  ): Promise<ApiResponse<JournalListItem[]>> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (careWorkerId) params.append('careWorkerId', careWorkerId.toString());
    
    return this.request(`/journal/list/date-range?${params.toString()}`);
  }

  async getJournal(id: number): Promise<JournalDetail> {
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

  async createJournalSummary(id: number): Promise<JournalSummaryResponse> {
    return this.request(`/journal/${id}/summary`, {
      method: 'POST'
    });
  }

  async convertJournalToPdf(id: number): Promise<{ pdf_url: string }> {
    return this.request(`/journal/${id}/convert-pdf`, {
      method: 'POST'
    });
  }

  async getJournalDocxDownload(id: number): Promise<{ download_url: string }> {
    return this.request(`/journal/${id}/download-docx`, {
      method: 'POST'
    });
  }

  async getJournalPdfDownload(id: number): Promise<{ download_url: string }> {
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

  async createReport(journalIds: number[]): Promise<ReportDetail[]> {
    return this.request('/report', {
      method: 'POST',
      body: JSON.stringify({ journalIds })
    });
  }

  async getReportDocxDownload(id: number): Promise<{ download_url: string }> {
    return this.request(`/report/${id}/download-docx`, {
      method: 'POST'
    });
  }

  async getReportPdfDownload(id: number): Promise<{ download_url: string }> {
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