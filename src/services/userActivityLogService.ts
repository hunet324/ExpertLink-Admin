import { apiClient } from './api';

export interface UserActivityLogQuery {
  search?: string;
  userType?: 'general' | 'expert' | 'staff' | 'center_manager' | 'regional_manager' | 'super_admin';
  actionCategory?: 'auth' | 'profile' | 'counseling' | 'payment' | 'test';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface UserActivityLog {
  id: number;
  timestamp: string;
  userId: number;
  userName: string;
  userType: string;
  action: string;
  category: string;
  details: string;
  ipAddress: string;
  userAgent?: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  createdAt: string;
}

export interface UserActivityLogListResponse {
  data: UserActivityLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserActivityLogStats {
  total: number;
  today: number;
  activeUsersToday: number;
  userTypeStats: { [key: string]: number };
  categoryStats: { [key: string]: number };
  recentActivity: Array<{
    date: string;
    count: number;
  }>;
}

class UserActivityLogService {
  private baseURL = '/admin/system/user-activity-logs';

  async getUserActivityLogs(params: UserActivityLogQuery = {}): Promise<UserActivityLogListResponse> {
    // camelCase를 snake_case로 변환
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.userType) queryParams.append('user_type', params.userType);
    if (params.actionCategory) queryParams.append('action_category', params.actionCategory);
    if (params.startDate) queryParams.append('start_date', params.startDate);
    if (params.endDate) queryParams.append('end_date', params.endDate);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${this.baseURL}?${queryString}` : this.baseURL;

    return apiClient.get<UserActivityLogListResponse>(endpoint);
  }

  async getUserActivityLogStats(params: { startDate?: string; endDate?: string } = {}): Promise<UserActivityLogStats> {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('start_date', params.startDate);
    if (params.endDate) queryParams.append('end_date', params.endDate);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${this.baseURL}/stats?${queryString}` : `${this.baseURL}/stats`;

    return apiClient.get<UserActivityLogStats>(endpoint);
  }

  // 사용자 타입 한글 변환
  getUserTypeLabel(userType: string): string {
    const labels: { [key: string]: string } = {
      'general': '일반 사용자',
      'expert': '전문가',
      'staff': '직원',
      'center_manager': '센터 관리자',
      'regional_manager': '지역 관리자',
      'super_admin': '최고 관리자'
    };
    return labels[userType] || userType;
  }

  // 액션 카테고리 한글 변환
  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'auth': '인증',
      'user': '사용자',
      'expert': '전문가',
      'profile': '프로필',
      'counseling': '상담',
      'payment': '결제',
      'test': '검사'
    };
    return labels[category] || category;
  }

  // 로그 레벨 색상 반환
  getLevelColor(level: string): string {
    const colors: { [key: string]: string } = {
      'debug': 'text-gray-600',
      'info': 'text-blue-600',
      'warn': 'text-yellow-600',
      'error': 'text-red-600'
    };
    return colors[level] || 'text-gray-600';
  }

  // 로그 레벨 배지 색상 반환
  getLevelBadgeColor(level: string): string {
    const colors: { [key: string]: string } = {
      'debug': 'bg-gray-100 text-gray-800',
      'info': 'bg-blue-100 text-blue-800',
      'warn': 'bg-yellow-100 text-yellow-800',
      'error': 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  }
}

export const userActivityLogService = new UserActivityLogService();
export default userActivityLogService;