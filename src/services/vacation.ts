// 휴가 관리 API 서비스

import { apiClient } from './api';

export interface VacationRecord {
  id: number;
  expert_id: number;
  expert_name: string;
  expert_email: string;
  approved_by?: number;
  approver_name?: string;
  start_date: string;
  end_date: string;
  vacation_type: 'annual' | 'sick' | 'personal' | 'emergency';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reason: string;
  rejection_reason?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface VacationListResponse {
  vacations: VacationRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateVacationRequest {
  expert_id: number;
  start_date: string;
  end_date: string;
  vacation_type?: 'annual' | 'sick' | 'personal' | 'emergency';
  reason: string;
}

export interface UpdateVacationStatusRequest {
  status: 'approved' | 'rejected';
  rejection_reason?: string;
}

export interface VacationQueryParams {
  expert_id?: number;
  center_id?: number;
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  vacation_type?: 'annual' | 'sick' | 'personal' | 'emergency';
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface VacationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export const vacationService = {
  // 휴가 신청
  async createVacation(data: CreateVacationRequest): Promise<VacationRecord> {
    return apiClient.post<VacationRecord>('/experts/vacation', data);
  },

  // 휴가 목록 조회
  async getVacations(params?: VacationQueryParams): Promise<VacationListResponse> {
    const queryString = params ? new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => [key, String(value)])
    ).toString() : '';
    
    const url = queryString ? `/experts/vacation?${queryString}` : '/experts/vacation';
    return apiClient.get<VacationListResponse>(url);
  },

  // 특정 전문가 휴가 목록 조회 (관리자용)
  async getVacationsByExpert(expertId: number, params?: VacationQueryParams): Promise<VacationListResponse> {
    const queryString = params ? new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => [key, String(value)])
    ).toString() : '';
    
    const url = queryString ? 
      `/experts/vacation/expert/${expertId}?${queryString}` : 
      `/experts/vacation/expert/${expertId}`;
    return apiClient.get<VacationListResponse>(url);
  },

  // 휴가 상세 조회
  async getVacationById(id: number): Promise<VacationRecord> {
    return apiClient.get<VacationRecord>(`/experts/vacation/${id}`);
  },

  // 휴가 상태 변경 (승인/거부)
  async updateVacationStatus(id: number, data: UpdateVacationStatusRequest): Promise<VacationRecord> {
    return apiClient.put<VacationRecord>(`/experts/vacation/${id}/status`, data);
  },

  // 휴가 삭제
  async deleteVacation(id: number): Promise<void> {
    return apiClient.delete(`/experts/vacation/${id}`);
  },

  // 휴가 통계 조회
  async getVacationStats(expertId?: number): Promise<VacationStats> {
    const url = expertId ? 
      `/experts/vacation/stats/summary?expert_id=${expertId}` : 
      '/experts/vacation/stats/summary';
    return apiClient.get<VacationStats>(url);
  },

  // 휴가 승인
  async approveVacation(id: number): Promise<VacationRecord> {
    return this.updateVacationStatus(id, { status: 'approved' });
  },

  // 휴가 거부
  async rejectVacation(id: number, reason: string): Promise<VacationRecord> {
    return this.updateVacationStatus(id, { 
      status: 'rejected', 
      rejection_reason: reason 
    });
  }
};