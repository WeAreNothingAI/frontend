export interface ClientInfo {
  clientId: number;
  clientName: string;
  attendance: boolean;
  schedule: string;
  journalStatus: '작성완료' | '미작성';
}

export interface ClientDetail {
  id: number;
  name: string;
  birthDate: string;
  gender: '남' | '여';
  planningTime?: string;
  address?: string;
  contact?: string;
  guardianContact?: string;
  careWorkerId: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientFormData {
  name: string;
  birthDate: string;
  gender: '남' | '여';
  planningTime?: string;
  address?: string;
  contact?: string;
  guardianContact?: string;
  careWorkerId: number;
  notes?: string;
}