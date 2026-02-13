
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: LeaveStatus;
  reason: string;
}

export interface LeaveBalance {
  type: string;
  total: number;
  used: number;
  remaining: number;
  color: string;
}
