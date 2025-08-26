// 시스템 로그 관리 API 서비스

import { apiClient } from './api';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogCategory = 'auth' | 'payment' | 'system' | 'user' | 'expert' | 'admin' | 'api' | 'database';

export interface SystemLogRecord {
  id: number;
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  action: string;
  userId?: number;
  userType?: string;
  userName?: string;
  ipAddress: string;
  userAgent?: string;
  details: string;
  requestId?: string;
  responseTime?: number;
  statusCode?: number;
  errorMessage?: string;
  stackTrace?: string;
  createdAt: string;
}

export interface SystemLogListResponse {
  data: SystemLogRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SystemLogStats {
  total: number;
  today: number;
  errors: number;
  warnings: number;
  levelStats: {
    debug: number;
    info: number;
    warn: number;
    error: number;
  };
  categoryStats: {
    [key: string]: number;
  };
}

export interface SystemLogFilters {
  search?: string;
  level?: LogLevel | 'all';
  category?: LogCategory | 'all';
  userId?: number;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export const systemLogService = {
  // 시스템 로그 목록 조회
  async getSystemLogs(filters: SystemLogFilters = {}): Promise<SystemLogListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== 'all') {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    const endpoint = queryString ? `/admin/system/logs?${queryString}` : '/admin/system/logs';
    
    return apiClient.get<SystemLogListResponse>(endpoint);
  },

  // 시스템 로그 통계 조회
  async getSystemLogStats(start_date?: string, end_date?: string): Promise<SystemLogStats> {
    const params = new URLSearchParams();
    
    if (start_date) params.append('start_date', start_date);
    if (end_date) params.append('end_date', end_date);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/admin/system/logs/stats?${queryString}` : '/admin/system/logs/stats';
    
    return apiClient.get<SystemLogStats>(endpoint);
  },

  // 시스템 로그 상세 조회
  async getSystemLogById(logId: number): Promise<SystemLogRecord> {
    return apiClient.get<SystemLogRecord>(`/admin/system/logs/${logId}`);
  },

  // 오래된 로그 정리
  async cleanupOldLogs(days: number = 30): Promise<{ success: boolean; message: string; deletedCount: number }> {
    return apiClient.delete<{ success: boolean; message: string; deletedCount: number }>(
      `/admin/system/logs/cleanup?days=${days}`
    );
  },

  // 시스템 로그 내보내기
  async exportSystemLogs(filters: SystemLogFilters = {}): Promise<{ success: boolean; downloadUrl: string; fileName: string }> {
    return apiClient.post<{ success: boolean; downloadUrl: string; fileName: string }>(
      '/admin/system/logs/export',
      filters
    );
  },

  // 레벨별 아이콘 가져오기
  getLevelIcon: (level: LogLevel): string => {
    const levelIcons = {
      'info': 'ℹ️',
      'warn': '⚠️',
      'error': '❌',
      'debug': '🐛'
    };
    return levelIcons[level];
  },

  // 레벨별 색상 가져오기
  getLevelColor: (level: LogLevel): string => {
    const levelColors = {
      'info': 'bg-primary text-white',
      'warn': 'bg-secondary-400 text-white',
      'error': 'bg-error text-white',
      'debug': 'bg-background-400 text-white'
    };
    return levelColors[level];
  },

  // 카테고리별 색상 가져오기
  getCategoryColor: (category: LogCategory): string => {
    const categoryColors = {
      'auth': 'bg-accent-100 text-accent-700',
      'payment': 'bg-primary-100 text-primary-700',
      'system': 'bg-error-100 text-error-700',
      'user': 'bg-secondary-100 text-secondary-700',
      'expert': 'bg-logo-point/20 text-logo-main',
      'admin': 'bg-purple-100 text-purple-700',
      'api': 'bg-green-100 text-green-700',
      'database': 'bg-orange-100 text-orange-700'
    };
    return categoryColors[category];
  },

  // 카테고리별 라벨 가져오기
  getCategoryLabel: (category: LogCategory): string => {
    const categoryLabels = {
      'auth': '인증',
      'payment': '결제',
      'system': '시스템',
      'user': '사용자',
      'expert': '전문가',
      'admin': '관리자',
      'api': 'API',
      'database': '데이터베이스'
    };
    return categoryLabels[category];
  },

  // 날짜 포맷팅
  formatTimestamp: (timestamp: string): string => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    // yyyy.MM.dd 형식
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // 오전/오후 및 시간 형식
    const hours = date.getHours();
    const isPM = hours >= 12;
    const displayHours = hours % 12 || 12; // 0시는 12시로 표시
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const period = isPM ? '오후' : '오전';
    
    return `${year}.${month}.${day}\n${period} ${String(displayHours).padStart(2, '0')}:${minutes}:${seconds}`;
  }
};