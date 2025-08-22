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

export interface CenterListResponse {
  centers: Center[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateCenterRequest {
  name: string;
  code: string;
  address: string;
  phone: string;
  managerId?: number;
  parentCenterId?: number;
  isActive?: boolean;
}

export const centerService = {
  // 관리 가능한 센터 목록 조회
  async getManagedCenters(): Promise<Center[]> {
    const response = await apiClient.get<CenterListResponse>('/admin/centers');
    return response.centers || [];
  },

  // 새 센터 생성
  async createCenter(data: CreateCenterRequest): Promise<Center> {
    return apiClient.post<Center>('/admin/centers', data);
  },

  // 센터 코드 중복 검사
  async checkCenterCode(code: string): Promise<{ available: boolean; message?: string }> {
    try {
      const response = await apiClient.get<{ available: boolean; message?: string }>(`/admin/centers/check-code?code=${encodeURIComponent(code)}`);
      return response;
    } catch (error: any) {
      // 404나 400 에러가 나면 API가 아직 구현되지 않은 것으로 간주
      if (error.statusCode === 404 || error.statusCode === 400) {
        console.warn('코드 중복 검사 API가 구현되지 않았습니다. 폴백 로직 사용.');
        // 폴백: 기존 센터 목록에서 검사
        return await this.checkCodeFallback(code);
      }
      
      if (error.statusCode === 409) {
        return { available: false, message: '이미 사용 중인 센터 코드입니다.' };
      }
      
      // 기타 에러는 사용 가능한 것으로 간주
      return { available: true };
    }
  },

  // 폴백: 기존 센터 목록에서 코드 중복 검사
  async checkCodeFallback(code: string): Promise<{ available: boolean; message?: string }> {
    try {
      const centers = await this.getManagedCenters();
      const isDuplicate = centers.some(center => 
        center.code && center.code.toUpperCase() === code.toUpperCase()
      );
      
      if (isDuplicate) {
        return { 
          available: false, 
          message: '이미 사용 중인 센터 코드입니다.' 
        };
      }
      
      return { 
        available: true, 
        message: '사용 가능한 센터 코드입니다.' 
      };
    } catch (error) {
      console.error('폴백 코드 검사 실패:', error);
      // 검사 실패 시 사용 가능한 것으로 간주
      return { available: true };
    }
  },

  // 센터 정보 수정
  async updateCenter(id: number, data: Partial<CreateCenterRequest>): Promise<Center> {
    return apiClient.put<Center>(`/admin/centers/${id}`, data);
  },

  // 센터 삭제
  async deleteCenter(id: number): Promise<void> {
    return apiClient.delete<void>(`/admin/centers/${id}`);
  },

  // 특정 센터 상세 조회
  async getCenterById(id: number): Promise<Center> {
    return apiClient.get<Center>(`/admin/centers/${id}`);
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

  // 현재 사용자 권한 확인
  async checkPermissions(): Promise<any> {
    return apiClient.get('/admin/permissions/check');
  },

  // 센터에 직원 배정
  async assignStaffToCenter(centerId: number, userId: number): Promise<any> {
    return apiClient.post(`/admin/centers/${centerId}/staff`, { userId });
  },

  // 센터에서 직원 배정 해제
  async removeStaffFromCenter(centerId: number, userId: number): Promise<any> {
    return apiClient.delete(`/admin/centers/${centerId}/staff/${userId}`);
  },

  // 센터에 전문가 배정
  async assignExpertToCenter(centerId: number, userId: number): Promise<any> {
    return apiClient.post(`/admin/centers/${centerId}/experts`, { userId });
  },

  // 센터에서 전문가 배정 해제
  async removeExpertFromCenter(centerId: number, userId: number): Promise<any> {
    return apiClient.delete(`/admin/centers/${centerId}/experts/${userId}`);
  }
};