import { ClientInfo, WorkEvent } from "@/lib/api";

export interface DashboardCareWorker {
  id: number;
  name: string;
  email: string;
  status: 'ON' | 'OFF';
  schedule?: string;
  reportStatus: '작성완료' | '미작성' | '';
  dailyStatus: '작성완료' | '미작성' | '';
  // 실제 데이터는 work API에서 계산
  isWorking?: boolean;
  todayEvents?: WorkEvent[];
  clients?: ClientInfo[];
}