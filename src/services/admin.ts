// 관리자 관련 API 서비스

import { apiClient } from './api';

// 실제 API 응답에 맞는 전문가 승인 타입 정의
export interface ExpertApplication {
  id: number | null;
  user_id: number;
  user_name: string;
  user_email: string;
  user_type: string;
  user_status: 'pending' | 'approved' | 'rejected' | 'under_review';
  is_expert_profile: boolean;
  license_number: string | null;
  license_type: string | null;
  specialization: string | null;
  years_experience: number | null;
  education: string | null;
  career_history: string | null;
  hourly_rate: number | null;
  introduction: string | null;
  verification_documents: any[];
  created_at: string;
  // Optional fields for backwards compatibility
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
  is_verified: boolean;
  verification_note?: string;
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
    const response = await apiClient.get<ExpertApplicationsResponse>('/admin/experts/pending');
    return response.experts;
  }

  /**
   * 전문가 승인/거부 처리
   */
  async verifyExpert(expertId: number, verificationData: ExpertVerificationDto): Promise<ExpertApplication> {
    console.log('=== 전문가 승인 요청 시작 ===')
    console.log('전문가 ID:', expertId);
    console.log('요청 데이터:', JSON.stringify(verificationData, null, 2));
    
    const endpoint = `/admin/experts/${expertId}/verify`;
    console.log(`API 엔드포인트: ${endpoint}`);
    
    try {
      const result = await apiClient.put<ExpertApplication>(endpoint, verificationData);
      console.log('승인 성공!');
      console.log('응답 데이터:', result);
      return result;
    } catch (error: any) {
      console.error('=== 승인 요청 실패 ===')
      console.error('에러 상세:', {
        status: error.statusCode,
        message: error.message,
        originalError: error.originalError,
        fullError: error
      });
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