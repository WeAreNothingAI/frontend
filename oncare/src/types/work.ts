export interface WorkEvent {
  id: number;
  workId: number;
  type: 'CLOCK_IN' | 'CLOCK_OUT';
  workTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkData {
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
