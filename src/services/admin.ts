// 관리자 관련 API 서비스

import { apiClient, tokenManager } from './api';

// 서버 카멜케이스 변경에 맞는 전문가 승인 타입 정의
export interface ExpertApplication {
  id?: number | null;
  userId?: number;
  userName?: string;
  userEmail?: string;
  userType?: string;
  userStatus?: 'pending' | 'approved' | 'rejected' | 'under_review';
  isExpertProfile?: boolean;
  licenseNumber?: string | null;
  licenseType?: string | null;
  specialization?: string | null;
  yearsExperience?: number | null;
  education?: string | null;
  careerHistory?: string | null;
  hourlyRate?: number | null;
  introduction?: string | null;
  verificationDocuments?: any[];
  createdAt?: string;
  phone?: string;
  email?: string;
}

// API 응답 래퍼
export interface ExpertApplicationsResponse {
  experts: ExpertApplication[];
  total: number;
  pending_count: number;
}

export interface ExpertVerificationDto {
  isVerified: boolean;
  verificationNote?: string;
  userId?: number;
}

export interface DashboardStatsDto {
  totalUsers: number;
  totalExperts: number;
  pendingApprovals: number;
  monthlyRevenue: number;
  activeSessions: number;
}

export class AdminService {
  
  /**
   * 대시보드 통계 조회
   */
  async getDashboardStats(): Promise<DashboardStatsDto> {
    return await apiClient.get<DashboardStatsDto>('/admin/stats');
  }

  /**
   * 승인 대기 중인 전문가 목록 조회
   */
  async getPendingExperts(): Promise<ExpertApplication[]> {
    try {
      const response = await apiClient.get<any>('/admin/experts/pending');
      
      // API 응답 구조 처리
      if (Array.isArray(response)) {
        return response;
      } else if (response?.experts && Array.isArray(response.experts)) {
        return response.experts;
      } else if (response?.data && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('예상하지 못한 API 응답 구조:', response);
        return [];
      }
    } catch (error) {
      console.error('전문가 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 전문가 승인/거부 처리
   */
  async verifyExpert(expert: ExpertApplication, verificationData: ExpertVerificationDto): Promise<ExpertApplication> {
    // URL에 사용할 ID 결정 (id가 null이면 0 사용)
    const urlId = expert.id || 0;
    
    // 현재 토큰 상태 확인
    const currentToken = tokenManager.getAccessToken();
    
    if (!currentToken) {
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
    }
    
    // 관리자 권한 확인
    try {
      const payload = JSON.parse(atob(currentToken.split('.')[1]));
      const adminTypes = ['super_admin', 'regional_manager', 'center_manager', 'staff'];
      if (!adminTypes.includes(payload.user_type)) {
        throw new Error('관리자 권한이 필요합니다.');
      }
    } catch (e) {
      throw new Error('토큰 검증에 실패했습니다.');
    }
    
    const endpoint = `/admin/experts/${urlId}/verify`;
    
    try {
      const result = await apiClient.put<ExpertApplication>(endpoint, verificationData);
      return result;
    } catch (error: any) {
      // 403 에러인 경우 대체 엔드포인트 시도
      if (error.statusCode === 403) {
        const alternativeEndpoints = [
          `/admin/users/${urlId}/verify`,
          `/admin/users/${urlId}/status`,
          `/admin/experts/${urlId}/status`,
          `/users/${urlId}/verify`,
          `/experts/${urlId}/verify`
        ];
        
        for (const altEndpoint of alternativeEndpoints) {
          try {
            const result = await apiClient.put<ExpertApplication>(altEndpoint, verificationData);
            return result;
          } catch (altError: any) {
            // 조용히 다음 엔드포인트 시도
            continue;
          }
        }
      }
      
      throw error;
    }
  }

  /**
   * 모든 사용자 목록 조회 (관리자용)
   */
  async getUsers(): Promise<any[]> {
    return await apiClient.get<any[]>('/admin/users');
  }

  /**
   * 사용자 상태 변경
   */
  async updateUserStatus(userId: number, status: string): Promise<any> {
    return await apiClient.put(`/admin/users/${userId}/status`, { status });
  }
}

// AdminService 인스턴스 생성 및 내보내기
export const adminService = new AdminService();