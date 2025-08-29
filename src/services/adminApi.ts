// 관리자 대시보드 API 서비스

import { apiClient } from './api';
import { AdminDashboardStats, RecentActivity, PendingApproval } from '@/types/admin';

export class AdminApiService {
  // 폴백 데이터 생성
  private static getFallbackStats(): AdminDashboardStats {
    return {
      users: {
        totalUsers: 0,
        activeUsers: 0,
        pendingUsers: 0,
        inactiveUsers: 0,
        newUsersToday: 0,
        newUsersThisWeek: 0,
        newUsersThisMonth: 0,
      },
      experts: {
        totalExperts: 0,
        verifiedExperts: 0,
        pendingVerification: 0,
        activeExperts: 0,
        averageRating: 0,
      },
      counselings: {
        totalCounselings: 0,
        completedCounselings: 0,
        pendingCounselings: 0,
        cancelledCounselings: 0,
        counselingsToday: 0,
        counselingsThisWeek: 0,
        counselingsThisMonth: 0,
        averageSessionDuration: 0,
      },
      contents: {
        totalContents: 0,
        publishedContents: 0,
        draftContents: 0,
        totalViews: 0,
        totalLikes: 0,
        mostViewedContent: null,
      },
      psychTests: {
        totalTests: 0,
        activeTests: 0,
        totalResponses: 0,
        responsesToday: 0,
        responsesThisWeek: 0,
        responsesThisMonth: 0,
        mostPopularTest: null,
      },
      system: {
        totalNotifications: 0,
        unreadNotifications: 0,
        chatMessagesToday: 0,
        loginSessionsToday: 0,
        serverUptime: '0 seconds',
        databaseSize: '0 MB',
      },
      generatedAt: new Date().toISOString(),
    };
  }

  // 대시보드 통계 조회
  static async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      console.log('🔍 대시보드 통계 API 호출 시작...');
      const response = await apiClient.get<any>('/admin/stats');
      console.log('✅ API 응답 수신:', response);
      
      // 응답 데이터 구조 확인
      if (!response) {
        console.error('❌ API 응답이 비어있습니다');
        throw new Error('서버에서 응답을 받지 못했습니다.');
      }

      // 서버 응답이 이미 camelCase이므로 직접 사용
      const transformedData = {
        users: {
          totalUsers: response.users?.totalUsers || 0,
          activeUsers: response.users?.activeUsers || 0,
          pendingUsers: response.users?.pendingUsers || 0,
          inactiveUsers: response.users?.inactiveUsers || 0,
          newUsersToday: response.users?.newUsersToday || 0,
          newUsersThisWeek: response.users?.newUsersThisWeek || 0,
          newUsersThisMonth: response.users?.newUsersThisMonth || 0,
        },
        experts: {
          totalExperts: response.experts?.totalExperts || 0,
          verifiedExperts: response.experts?.verifiedExperts || 0,
          pendingVerification: response.experts?.pendingVerification || 0,
          activeExperts: response.experts?.activeExperts || 0,
          averageRating: response.experts?.averageRating || 0,
        },
        counselings: {
          totalCounselings: response.counselings?.totalCounselings || 0,
          completedCounselings: response.counselings?.completedCounselings || 0,
          pendingCounselings: response.counselings?.pendingCounselings || 0,
          cancelledCounselings: response.counselings?.cancelledCounselings || 0,
          counselingsToday: response.counselings?.counselingsToday || 0,
          counselingsThisWeek: response.counselings?.counselingsThisWeek || 0,
          counselingsThisMonth: response.counselings?.counselingsThisMonth || 0,
          averageSessionDuration: response.counselings?.averageSessionDuration || 0,
        },
        contents: {
          totalContents: response.contents?.totalContents || 0,
          publishedContents: response.contents?.publishedContents || 0,
          draftContents: response.contents?.draftContents || 0,
          totalViews: response.contents?.totalViews || 0,
          totalLikes: response.contents?.totalLikes || 0,
          mostViewedContent: response.contents?.mostViewedContent ? {
            id: response.contents.mostViewedContent.id,
            title: response.contents.mostViewedContent.title,
            views: response.contents.mostViewedContent.views,
          } : null,
        },
        psychTests: {
          totalTests: response.psychTests?.totalTests || 0,
          activeTests: response.psychTests?.activeTests || 0,
          totalResponses: response.psychTests?.totalResponses || 0,
          responsesToday: response.psychTests?.responsesToday || 0,
          responsesThisWeek: response.psychTests?.responsesThisWeek || 0,
          responsesThisMonth: response.psychTests?.responsesThisMonth || 0,
          mostPopularTest: response.psychTests?.mostPopularTest ? {
            id: response.psychTests.mostPopularTest.id,
            title: response.psychTests.mostPopularTest.title,
            responseCount: response.psychTests.mostPopularTest.responseCount,
          } : null,
        },
        system: {
          totalNotifications: response.system?.totalNotifications || 0,
          unreadNotifications: response.system?.unreadNotifications || 0,
          chatMessagesToday: response.system?.chatMessagesToday || 0,
          loginSessionsToday: response.system?.loginSessionsToday || 0,
          serverUptime: response.system?.serverUptime || '0 seconds',
          databaseSize: response.system?.databaseSize || '0 MB',
        },
        generatedAt: response.generatedAt || new Date().toISOString(),
      };

      console.log('🔄 변환된 데이터:', transformedData);
      return transformedData;

    } catch (error: any) {
      console.error('❌ 대시보드 통계 조회 실패 상세:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      
      // 구체적인 에러 메시지 생성
      let errorMessage = '대시보드 통계를 불러올 수 없습니다.';
      
      if (error.response) {
        const status = error.response.status;
        switch (status) {
          case 401:
            errorMessage = '로그인이 필요합니다. 다시 로그인해주세요.';
            break;
          case 403:
            errorMessage = '접근 권한이 없습니다. 관리자 권한을 확인해주세요.';
            break;
          case 404:
            errorMessage = '대시보드 API를 찾을 수 없습니다. (404)';
            break;
          case 500:
            errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            break;
          default:
            errorMessage = `API 오류 (${status}): ${error.response.data?.message || error.message}`;
        }
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = '네트워크 연결을 확인해주세요.';
      }
      
      throw new Error(errorMessage);
    }
  }

  // 최근 활동 조회 (시스템 로그 기반)
  static async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    try {
      console.log('🔍 최근 활동 API 호출...');
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        page: '1'
      });
      const response = await apiClient.get<{ data: any[]; pagination: any }>(`/admin/system/logs?${queryParams}`);
      console.log('✅ 최근 활동 응답:', response);

      if (!response.data || !Array.isArray(response.data)) {
        console.warn('⚠️ 시스템 로그가 없거나 잘못된 형식입니다');
        return [];
      }

      // 시스템 로그를 최근 활동 형태로 변환
      return response.data
        .filter(log => log && log.id) // null/undefined 필터링
        .map(log => ({
          id: String(log.id || ''),
          type: this.mapLogToActivityType(log.action || ''),
          description: this.formatLogDescription(log),
          timestamp: log.timestamp || log.created_at || new Date().toISOString(),
          status: this.mapLogLevelToStatus(log.level || 'info'),
          userId: log.userId || log.user_id,
          userType: log.userType || log.user_type,
          userName: log.userName || log.user_name,
          details: log.details
        }));
    } catch (error: any) {
      console.error('❌ 최근 활동 조회 실패:', error);
      // 실패 시 빈 배열 반환
      return [];
    }
  }

  // 승인 대기 목록 조회
  static async getPendingApprovals(): Promise<PendingApproval[]> {
    try {
      console.log('🔍 승인 대기 목록 API 호출...');
      const response = await apiClient.get<{ experts: any[] }>('/admin/experts/pending');
      console.log('✅ 승인 대기 목록 응답:', response);
      
      if (!response.experts || !Array.isArray(response.experts)) {
        console.warn('⚠️ 승인 대기 목록이 없거나 잘못된 형식입니다');
        return [];
      }
      
      return response.experts
        .filter(expert => expert && (expert.id || expert.userId)) // null/undefined 필터링
        .map(expert => ({
          id: String(expert.id || expert.userId || ''),
          type: 'expert' as const,
          name: expert.userName || expert.name || '이름 없음',
          email: expert.userEmail || expert.email || '',
          submittedAt: expert.createdAt && typeof expert.createdAt === 'object' ? new Date().toISOString() : expert.createdAt || new Date().toISOString(),
          priority: this.calculatePriority(expert.createdAt && typeof expert.createdAt === 'object' ? new Date().toISOString() : expert.createdAt || new Date().toISOString()),
          status: 'pending' as const
        }));
    } catch (error: any) {
      console.error('❌ 승인 대기 목록 조회 실패:', error);
      // 에러 발생 시 빈 배열 반환 (UI 깨짐 방지)
      return [];
    }
  }

  // 전체 전문가 목록 조회 (시스템 상담사 목록용)
  static async getAllExperts(): Promise<any[]> {
    try {
      console.log('🔍 전체 전문가 목록 API 호출...');
      const response = await apiClient.get('/admin/experts');
      console.log('✅ 전체 전문가 목록 응답:', response);
      
      if (!Array.isArray(response)) {
        console.warn('⚠️ 전문가 목록이 없거나 잘못된 형식입니다');
        return [];
      }
      
      return response
        .filter(expert => expert && expert.id) // null/undefined 필터링
        .map(expert => ({
          id: String(expert.id || expert.userId || ''),
          name: expert.userName || expert.name || '이름 없음',
          email: expert.userEmail || expert.email || '',
          phone: expert.userPhone || expert.phone || '',
          birthDate: expert.userBirthDate || expert.birthDate || '',
          gender: expert.userGender || expert.gender || 'male',
          licenseNumber: expert.licenseNumber || '',
          licenseType: expert.licenseType || '',
          specializations: Array.isArray(expert.specialization) ? expert.specialization : 
                          (typeof expert.specialization === 'string' ? expert.specialization.split(',') : []),
          experience: expert.yearsExperience || expert.experience || 0,
          education: Array.isArray(expert.education) ? expert.education : 
                    (typeof expert.education === 'string' ? expert.education.split(',') : []),
          certifications: Array.isArray(expert.certifications) ? expert.certifications :
                         (typeof expert.certifications === 'string' ? expert.certifications.split(',') : []),
          workHistory: expert.careerHistory || [],
          bio: expert.introduction || expert.bio || '',
          status: expert.userStatus || expert.status || 'active',
          joinedAt: expert.userCreatedAt || expert.createdAt || new Date().toISOString(),
          lastLogin: expert.lastLoginAt || expert.lastLogin || '',
          consultationCount: expert.counselingCount || expert.consultationCount || 0,
          rating: expert.averageRating || expert.rating || 0,
          consultationTypes: {
            video: expert.supportVideo || true,
            chat: expert.supportChat || true,
            voice: expert.supportVoice || true,
          },
          rates: {
            video: expert.videoRate || expert.hourlyRate || 0,
            chat: expert.chatRate || expert.hourlyRate || 0,
            voice: expert.voiceRate || expert.hourlyRate || 0,
          },
          totalEarnings: expert.totalRevenue || expert.totalEarnings || 0,
          clientCount: expert.totalClients || expert.clientCount || 0,
        }));
    } catch (error: any) {
      console.error('❌ 전체 전문가 목록 조회 실패:', error);
      // 에러 발생 시 빈 배열 반환 (UI 깨짐 방지)
      return [];
    }
  }

  // 전문가 상태 변경 (사용자 상태 변경 API 사용)
  static async updateExpertStatus(expertId: string, status: 'active' | 'inactive' | 'suspended'): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`🔄 전문가 ${expertId} 상태 변경 시작:`, { status });
      
      // 프론트엔드에서 사용하는 상태를 서버에서 사용하는 상태로 매핑
      const statusMapping = {
        'active': 'active',
        'inactive': 'inactive', 
        'suspended': 'withdrawn' // suspended -> withdrawn으로 매핑
      };
      
      const mappedStatus = statusMapping[status] || status;
      
      const response = await apiClient.put(`/admin/users/${expertId}/status`, {
        status: mappedStatus
      });
      
      console.log('✅ 전문가 상태 변경 성공:', response);
      
      return {
        success: true,
        message: `전문가 상태가 ${status === 'active' ? '활성화' : status === 'inactive' ? '비활성화' : '정지'}로 변경되었습니다.`
      };
    } catch (error: any) {
      console.error('❌ 전문가 상태 변경 실패:', error);
      
      let errorMessage = '전문가 상태 변경에 실패했습니다.';
      if (error.response) {
        const status = error.response.status;
        switch (status) {
          case 403:
            errorMessage = '권한이 부족합니다. 관리자 권한을 확인해주세요.';
            break;
          case 404:
            errorMessage = '전문가를 찾을 수 없습니다.';
            break;
          case 400:
            errorMessage = `잘못된 요청입니다: ${error.response.data?.message || error.message}`;
            break;
          default:
            errorMessage = `서버 오류 (${status}): ${error.response.data?.message || error.message}`;
        }
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  // 로그 액션을 활동 타입으로 매핑
  private static mapLogToActivityType(action: string): RecentActivity['type'] {
    switch (action) {
      case 'USER_REGISTRATION':
      case 'USER_LOGIN':
        return 'user_registration';
      case 'EXPERT_APPLICATION':
      case 'EXPERT_VERIFICATION':
        return 'expert_application';
      case 'COUNSELING_COMPLETED':
      case 'SESSION_COMPLETED':
        return 'session_completed';
      case 'PAYMENT_COMPLETED':
      case 'PAYMENT_FAILED':
        return 'payment';
      default:
        return 'system_alert';
    }
  }

  // 로그 레벨을 상태로 매핑
  private static mapLogLevelToStatus(level: string): RecentActivity['status'] {
    switch (level?.toLowerCase()) {
      case 'error':
        return 'error';
      case 'warn':
        return 'warning';
      case 'info':
        return 'success';
      case 'debug':
      default:
        return 'info';
    }
  }

  // 로그 설명 포맷팅
  private static formatLogDescription(log: any): string {
    if (!log) return '시스템 활동이 발생했습니다.';
    
    const userName = log.userName || log.user_name;
    const userNameText = userName ? `${userName}님이` : '';
    const action = log.action || '';
    const details = log.details || '';
    
    // 액션에 따른 한국어 메시지 생성
    switch (action) {
      case 'USER_LOGIN':
        return `${userNameText} 로그인했습니다.`;
      case 'USER_REGISTRATION':
        return `${userNameText} 새로 가입했습니다.`;
      case 'EXPERT_APPLICATION':
        return `${userNameText} 전문가 등록을 신청했습니다.`;
      case 'COUNSELING_COMPLETED':
        return `상담이 완료되었습니다.`;
      case 'PAYMENT_COMPLETED':
        return `결제가 완료되었습니다.`;
      case 'SYSTEM_ALERT':
        return details || '시스템 알림이 발생했습니다.';
      default:
        return details || `시스템 활동: ${action || '알 수 없는 활동'}`;
    }
  }

  // 승인 우선순위 계산
  private static calculatePriority(createdAt: string): PendingApproval['priority'] {
    try {
      if (!createdAt) return 'low';
      
      const now = new Date();
      const created = new Date(createdAt);
      
      // 유효하지 않은 날짜인 경우
      if (isNaN(created.getTime())) return 'low';
      
      const diffHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
      
      if (diffHours > 48) return 'high';  // 48시간 이상
      if (diffHours > 24) return 'medium'; // 24시간 이상
      return 'low';
    } catch (error) {
      console.warn('우선순위 계산 실패:', error);
      return 'low';
    }
  }
}