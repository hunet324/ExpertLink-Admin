// 센터 관리 API 서비스

import { apiClient } from './api';

export interface Center {
  id: number;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  managerId?: number;
  parentCenterId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CenterListResponse {
  centers: Center[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CenterExpertResponse {
  id: number;
  name: string;
  email: string;
  userType: string;
  status: string;
  specialties?: string[];
  licenseType?: string;
  experience?: number;
  rating?: number;
  completedSessions?: number;
  joinedAt: string;
  createdAt: string;
  centerId?: number;
  centerName?: string;
}

export interface CenterStaffResponse {
  id: number;
  name: string;
  email: string;
  userType: string;
  status: string;
  phone?: string;
  joinedAt: string;
  createdAt: string;
  centerId?: number;
  supervisorId?: number;
}

export interface WorkingHoursResponse {
  expertId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  totalHours: number;
  sessionCount: number;
  breakTime?: number;
}

export const centerService = {
  // 모든 센터 목록 조회 (드롭다운용 - 간단한 형태)
  async getAllCentersSimple(): Promise<Center[]> {
    try {
      console.log('센터 목록 API 호출 시작: /admin/centers?isActive=true&limit=100');
      // 활성화된 센터만 조회하고 페이지네이션 없이 모든 결과 가져오기
      const response = await apiClient.get<CenterListResponse>('/admin/centers?isActive=true&limit=100');
      console.log('센터 목록 API 응답 전체:', response);
      console.log('센터 배열:', response.centers);
      console.log('센터 배열 길이:', response.centers?.length || 0);
      
      if (response.centers && Array.isArray(response.centers)) {
        return response.centers;
      } else {
        console.warn('응답에 centers 배열이 없거나 배열이 아닙니다:', typeof response.centers);
        return [];
      }
    } catch (error) {
      console.error('센터 목록 조회 실패:', error);
      console.error('에러 타입:', typeof error);
      console.error('에러 상세:', {
        message: (error as any)?.message,
        statusCode: (error as any)?.statusCode,
        response: (error as any)?.response
      });
      return [];
    }
  },

  // 현재 사용자가 관리할 수 있는 센터 목록 조회
  async getManagedCenters(): Promise<Center[]> {
    try {
      // TODO: 백엔드에 `/admin/centers/managed` API 엔드포인트 추가 필요
      // 현재는 전체 센터 목록을 조회하고 프론트엔드에서 권한 필터링
      console.warn('getManagedCenters: 백엔드 API 개발 전까지 전체 센터 목록 사용');
      return await this.getAllCentersSimple();
    } catch (error) {
      console.error('관리 센터 목록 조회 실패:', error);
      return [];
    }
  },

  // 센터 목록 조회 (페이지네이션 포함)
  async getAllCenters(params?: {
    page?: number;
    limit?: number;
    search?: string;
    parentCenterId?: number;
    isActive?: boolean;
  }): Promise<CenterListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.parentCenterId) queryParams.append('parentCenterId', params.parentCenterId.toString());
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const queryString = queryParams.toString();
    const endpoint = `/admin/centers${queryString ? '?' + queryString : ''}`;
    
    return apiClient.get<CenterListResponse>(endpoint);
  },

  // 특정 센터 상세 조회
  async getCenterById(id: number): Promise<Center> {
    return apiClient.get<Center>(`/admin/centers/${id}`);
  },

  // 센터 코드 중복 검사
  async checkCenterCode(code: string): Promise<{ available: boolean; message?: string }> {
    try {
      return await apiClient.get<{ available: boolean; message?: string }>(`/admin/centers/check-code?code=${encodeURIComponent(code)}`);
    } catch (error) {
      console.error('센터 코드 중복 검사 실패:', error);
      return { available: false, message: '코드 검사 중 오류가 발생했습니다.' };
    }
  },

  // 센터 정보 수정
  async updateCenter(id: number, data: Partial<Center>): Promise<Center> {
    try {
      // camelCase로 전송하면 서버에서 자동으로 snake_case로 변환됨
      return await apiClient.put<Center>(`/admin/centers/${id}`, data);
    } catch (error) {
      console.error('센터 정보 수정 실패:', error);
      throw error;
    }
  },

  // 센터 생성
  async createCenter(data: Omit<Center, 'id' | 'createdAt' | 'updatedAt'>): Promise<Center> {
    try {
      // camelCase로 전송하면 서버에서 자동으로 snake_case로 변환됨
      return await apiClient.post<Center>('/admin/centers', data);
    } catch (error) {
      console.error('센터 생성 실패:', error);
      throw error;
    }
  },

  // 센터 삭제
  async deleteCenter(id: number): Promise<void> {
    try {
      await apiClient.delete(`/admin/centers/${id}`);
    } catch (error) {
      console.error('센터 삭제 실패:', error);
      throw error;
    }
  },

  // 센터 소속 전문가 목록 조회
  async getCenterExperts(centerId: number): Promise<CenterExpertResponse[]> {
    try {
      return await apiClient.get<CenterExpertResponse[]>(`/admin/centers/${centerId}/experts`);
    } catch (error) {
      console.error('센터 전문가 목록 조회 실패:', error);
      throw error;
    }
  },

  // 센터 소속 직원 목록 조회  
  async getCenterStaff(centerId: number): Promise<CenterStaffResponse[]> {
    try {
      return await apiClient.get<CenterStaffResponse[]>(`/admin/centers/${centerId}/staff`);
    } catch (error) {
      console.error('센터 직원 목록 조회 실패:', error);
      throw error;
    }
  },

  // 센터에 전문가 배정
  async assignExpertToCenter(centerId: number, userId: number): Promise<any> {
    try {
      return await apiClient.post(`/admin/centers/${centerId}/experts`, { userId });
    } catch (error) {
      console.error('센터 전문가 배정 실패:', error);
      throw error;
    }
  },

  // 센터에서 전문가 배정 해제
  async removeExpertFromCenter(centerId: number, userId: number): Promise<any> {
    try {
      return await apiClient.delete(`/admin/centers/${centerId}/experts/${userId}`);
    } catch (error) {
      console.error('센터 전문가 배정 해제 실패:', error);
      throw error;
    }
  },

  // 센터에 직원 배정
  async assignStaffToCenter(centerId: number, userId: number): Promise<any> {
    try {
      return await apiClient.post(`/admin/centers/${centerId}/staff`, { userId });
    } catch (error) {
      console.error('센터 직원 배정 실패:', error);
      throw error;
    }
  },

  // 센터에서 직원 배정 해제
  async removeStaffFromCenter(centerId: number, userId: number): Promise<any> {
    try {
      return await apiClient.delete(`/admin/centers/${centerId}/staff/${userId}`);
    } catch (error) {
      console.error('센터 직원 배정 해제 실패:', error);
      throw error;
    }
  },

  // 전문가 근무시간 조회
  async getExpertWorkingHours(expertId: number, startDate: string, endDate: string): Promise<any[]> {
    try {
      const response = await apiClient.get<any[]>(`/admin/experts/${expertId}/working-hours?startDate=${startDate}&endDate=${endDate}`);
      return response;
    } catch (error) {
      console.error('전문가 근무시간 조회 실패:', error);
      return [];
    }
  },

  // 관리 가능한 모든 전문가 조회
  async getAllManagedExperts(): Promise<CenterExpertResponse[]> {
    try {
      const response = await apiClient.get<CenterExpertResponse[]>('/admin/experts/managed');
      return response;
    } catch (error) {
      console.error('관리 전문가 목록 조회 실패:', error);
      return [];
    }
  }
};