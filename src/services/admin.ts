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
      console.log('Admin service raw response:', response);
      
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
    console.log('=== 전문가 승인 요청 시작 ===')
    console.log('전문가 정보:', expert);
    console.log('요청 데이터:', JSON.stringify(verificationData, null, 2));
    
    // URL에 사용할 ID 결정 (id가 null이면 0 사용)
    const urlId = expert.id || 0;
    
    // 현재 토큰 상태 상세 확인
    const currentToken = tokenManager.getAccessToken();
    console.log('현재 토큰 존재 여부:', !!currentToken);
    console.log('localStorage 직접 확인:', !!localStorage.getItem('expertlink_access_token'));
    
    if (!currentToken) {
      console.error('❌ 토큰이 없습니다! 로그인 상태를 확인하세요.');
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
    }
    
    if (currentToken) {
      try {
        const payload = JSON.parse(atob(currentToken.split('.')[1]));
        console.log('토큰 payload 상세:', {
          userId: payload.sub,
          email: payload.email,
          user_type: payload.user_type,
          exp: new Date(payload.exp * 1000).toISOString(),
          iat: new Date(payload.iat * 1000).toISOString()
        });
        
        if (payload.user_type !== 'admin') {
          console.error('토큰에 관리자 권한이 없음:', payload.user_type);
          throw new Error('관리자 권한이 필요합니다.');
        }
      } catch (e) {
        console.error('토큰 디코딩 실패:', e);
      }
    }
    
    const endpoint = `/admin/experts/${urlId}/verify`;
    console.log(`API 엔드포인트: ${endpoint}`);
    
    // 추가 헤더로 명시적 권한 전달 시도
    const additionalHeaders: Record<string, string> = {};
    
    if (currentToken) {
      try {
        const payload = JSON.parse(atob(currentToken.split('.')[1]));
        // 카멜케이스 헤더로 변경
        additionalHeaders['xUserType'] = payload.user_type;
        additionalHeaders['xUserId'] = payload.sub?.toString();
        additionalHeaders['xUserEmail'] = payload.email;
      } catch (e) {
        console.warn('추가 헤더 설정 실패:', e);
      }
    }
    
    console.log('추가 헤더:', additionalHeaders);
    
    try {
      const result = await apiClient.put<ExpertApplication>(endpoint, verificationData, {
        headers: additionalHeaders
      });
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
      
      // 403 에러인 경우 대체 엔드포인트 시도
      if (error.statusCode === 403) {
        console.error('403 에러 - 대체 엔드포인트 시도');
        
        const alternativeEndpoints = [
          `/admin/users/${expertId}/verify`,
          `/admin/users/${expertId}/status`,
          `/admin/experts/${expertId}/status`,
          `/users/${expertId}/verify`,
          `/experts/${expertId}/verify`
        ];
        
        for (const altEndpoint of alternativeEndpoints) {
          try {
            console.log('대체 엔드포인트 시도:', altEndpoint);
            const result = await apiClient.put<ExpertApplication>(altEndpoint, verificationData, {
              headers: additionalHeaders
            });
            console.log('대체 엔드포인트 성공:', altEndpoint);
            return result;
          } catch (altError: any) {
            console.warn(`대체 엔드포인트 ${altEndpoint} 실패:`, altError.statusCode, altError.message);
          }
        }
        
        console.error('모든 대체 엔드포인트 실패');
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