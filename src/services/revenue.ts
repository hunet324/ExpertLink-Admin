// 매출 통계 API 서비스

import { apiClient } from './api';

export interface RevenueData {
  period: string;
  totalRevenue: number;
  platformFee: number;
  expertRevenue: number;
  transactionCount: number;
  averageTransaction: number;
  serviceBreakdown: {
    video: { count: number; revenue: number };
    chat: { count: number; revenue: number };
    voice: { count: number; revenue: number };
    test: { count: number; revenue: number };
  };
  refundAmount: number;
  growthRate: number;
}

export interface RevenueStats {
  totalRevenue: number;
  platformFee: number;
  expertRevenue: number;
  transactionCount: number;
  averageTransaction: number;
  serviceBreakdown: {
    video: { count: number; revenue: number };
    chat: { count: number; revenue: number };
    voice: { count: number; revenue: number };
    test: { count: number; revenue: number };
  };
  refundAmount: number;
  averageMonthlyRevenue: number;
  feePercentage: number;
}

export interface ExpertRanking {
  expertId: number;
  expertName: string;
  totalRevenue: number;
  transactionCount: number;
  averageRating: number;
  specialization: string;
  commission: number;
}

export const revenueService = {
  // 매출 통계 조회
  async getRevenueStats(periodType: string = 'monthly', startDate?: string, endDate?: string): Promise<RevenueStats> {
    const params = new URLSearchParams();
    
    params.append('periodType', periodType);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/admin/revenue/stats?${queryString}` : '/admin/revenue/stats';
    
    return apiClient.get<RevenueStats>(endpoint);
  },

  // 매출 트렌드 조회
  async getRevenueTrends(periodType: string = 'monthly', startDate?: string, endDate?: string): Promise<RevenueData[]> {
    const params = new URLSearchParams();
    
    params.append('periodType', periodType);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/admin/revenue/trends?${queryString}` : '/admin/revenue/trends';
    
    return apiClient.get<RevenueData[]>(endpoint);
  },

  // 전문가 매출 랭킹 조회
  async getExpertRankings(startDate?: string, endDate?: string, limit: number = 10): Promise<ExpertRanking[]> {
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('limit', String(limit));
    
    const queryString = params.toString();
    const endpoint = queryString ? `/admin/revenue/expert-rankings?${queryString}` : '/admin/revenue/expert-rankings';
    
    return apiClient.get<ExpertRanking[]>(endpoint);
  }
};