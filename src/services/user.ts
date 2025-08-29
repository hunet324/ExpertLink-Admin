// 사용자 관리 API 서비스

import { apiClient } from './api';
import { User, UserType } from '@/types/user';

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  phone?: string;
  userType: UserType;
  centerId?: number;
  supervisorId?: number;
  status: string;
  
  // 센터 정보
  centerName?: string;
  centerCode?: string;
  createdAt: string;
  updatedAt: string;
  
  // 추가 통계 데이터
  counselingCount?: number;
  contentCount?: number;
  psychTestCount?: number;
  lastLoginAt?: string;
  isVerified?: boolean;
  
  // 인증 상태
  emailVerified?: boolean;
  phoneVerified?: boolean;
  
  // 활동 통계
  loginCount?: number;
  totalSessions?: number;
  totalPayments?: number;
}

export interface UserListResponse {
  users: UserResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AvailableManager {
  id: number;
  name: string;
  email: string;
  userType: UserType;
  centerId?: number;
}

export const userService = {
  // 센터장으로 지정 가능한 사용자 목록 조회
  async getAvailableManagers(): Promise<AvailableManager[]> {
    try {
      // center_manager 타입의 모든 사용자 조회 후 프론트에서 필터링
      const response = await apiClient.get<UserListResponse>('/admin/users?userType=center_manager&limit=100');
      
      // centerId가 없는 사용자만 필터링 (아직 센터를 관리하지 않는 사용자)
      const availableManagers = response.users
        .filter(user => !user.centerId) // centerId가 없는 사용자만
        .map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          centerId: user.centerId
        }));
      
      return availableManagers;
    } catch (error) {
      console.error('센터장 목록 조회 실패:', error);
      // 실패 시 빈 배열 반환
      return [];
    }
  },

  // 모든 사용자 목록 조회
  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    userType?: UserType;
    search?: string;
    status?: string;
  }): Promise<UserListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.userType) queryParams.append('userType', params.userType);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const endpoint = `/admin/users${queryString ? '?' + queryString : ''}`;
    
    return apiClient.get<UserListResponse>(endpoint);
  },

  // 특정 사용자 조회
  async getUserById(id: number): Promise<UserResponse> {
    try {
      // 먼저 새로운 API 엔드포인트 시도
      return await apiClient.get<UserResponse>(`/admin/users/${id}`);
    } catch (error: any) {
      if (error.statusCode === 404) {
        // 404 에러 시 사용자 목록에서 해당 ID 찾기 (fallback)
        console.warn('Direct user API not available, using fallback method');
        
        // 여러 페이지를 조회해서 해당 사용자 찾기
        let page = 1;
        let user = null;
        
        while (page <= 10) { // 최대 10페이지까지 검색 (1000명)
          try {
            const userList = await this.getAllUsers({ page, limit: 100 });
            user = userList.users.find(u => u.id === id);
            if (user) break;
            
            // 마지막 페이지인 경우 중단
            if (page >= userList.totalPages) break;
            page++;
          } catch (err) {
            console.error(`페이지 ${page} 조회 실패:`, err);
            break;
          }
        }
        
        if (!user) {
          throw new Error('사용자를 찾을 수 없습니다.');
        }
        return user;
      }
      throw error;
    }
  },

  // 사용자 정보 수정
  async updateUser(id: number, data: Partial<{
    name: string;
    email: string;
    phone?: string;
    userType: UserType;
    centerId?: number | null;
    supervisorId?: number;
    status: string;
    bio?: string;
    specialties?: string[];
    yearsExperience?: number;
    hourlyRate?: number;
    licenseType?: string;
    licenseNumber?: string;
    notes?: string;
  }>): Promise<UserResponse> {
    console.log(`사용자 ${id} 정보 수정 시도:`, data);
    
    try {
      const result = await apiClient.put<UserResponse>(`/admin/users/${id}`, data);
      console.log('사용자 정보 수정 성공:', result);
      return result;
    } catch (error: any) {
      console.error('사용자 정보 수정 실패:', error);
      console.error('에러 상태코드:', error.statusCode);
      console.error('에러 메시지:', error.message);
      
      if (error.statusCode === 404) {
        throw new Error(`❌ API 엔드포인트가 없습니다 (PUT /admin/users/${id}). 백엔드 서버를 재시작해주세요.`);
      } else if (error.statusCode === 405) {
        throw new Error(`❌ 허용되지 않은 메서드입니다 (PUT /admin/users/${id}). API 구현을 확인해주세요.`);
      } else if (error.statusCode === 403) {
        throw new Error('❌ 권한이 부족합니다. 관리자 권한을 확인해주세요.');
      } else if (error.statusCode === 400) {
        throw new Error(`❌ 잘못된 요청입니다: ${error.message}`);
      }
      
      throw new Error(`❌ 서버 오류: ${error.message || '알 수 없는 오류'}`);
    }
  }
};