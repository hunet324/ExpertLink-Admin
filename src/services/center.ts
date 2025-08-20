// 센터 관리 API 서비스

import { apiClient } from './api';
import { Center } from '@/types/user';

export interface CenterStaffResponse {
  id: number;
  name: string;
  email: string;
  user_type: string;
  center_id: number;
  supervisor_id?: number;
  createdAt: string;
}

export interface CenterExpertResponse {
  id: number;
  name: string;
  email: string;
  specialties?: string[];
  status: string;
  center_id: number;
  createdAt: string;
}

export interface VacationRequest {
  expertId: number;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface WorkingHoursResponse {
  expertId: number;
  date: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  breakTime?: number;
}

export const centerService = {
  // 관리 가능한 센터 목록 조회
  async getManagedCenters(): Promise<Center[]> {
    return apiClient.get<Center[]>('/admin/centers');
  },

  // 특정 센터의 직원 목록 조회
  async getCenterStaff(centerId: number): Promise<CenterStaffResponse[]> {
    return apiClient.get<CenterStaffResponse[]>(`/admin/centers/${centerId}/staff`);
  },

  // 특정 센터의 전문가 목록 조회
  async getCenterExperts(centerId: number): Promise<CenterExpertResponse[]> {
    return apiClient.get<CenterExpertResponse[]>(`/admin/centers/${centerId}/experts`);
  },

  // 전문가 휴가 설정
  async setExpertVacation(vacationData: VacationRequest): Promise<any> {
    return apiClient.put(`/admin/experts/${vacationData.expertId}/vacation`, {
      startDate: vacationData.startDate,
      endDate: vacationData.endDate,
      reason: vacationData.reason
    });
  },

  // 전문가 근무시간 조회
  async getExpertWorkingHours(
    expertId: number, 
    startDate: string, 
    endDate: string
  ): Promise<WorkingHoursResponse[]> {
    const params = new URLSearchParams({
      startDate,
      endDate
    });
    return apiClient.get<WorkingHoursResponse[]>(`/admin/experts/${expertId}/working-hours?${params}`);
  },

  // 전체 관리 직원 목록 조회
  async getAllManagedStaff(): Promise<CenterStaffResponse[]> {
    return apiClient.get<CenterStaffResponse[]>('/admin/staff');
  },

  // 전체 관리 전문가 목록 조회
  async getAllManagedExperts(): Promise<CenterExpertResponse[]> {
    return apiClient.get<CenterExpertResponse[]>('/admin/experts');
  },

  // 지역별 통계 조회
  async getRegionalStatistics(): Promise<any> {
    return apiClient.get('/admin/regional/statistics');
  },

  // 센터 계층 구조 조회
  async getCenterHierarchy(): Promise<any> {
    return apiClient.get('/admin/hierarchy');
  },

  // 현재 사용자 권한 확인
  async checkPermissions(): Promise<any> {
    return apiClient.get('/admin/permissions/check');
  }
};