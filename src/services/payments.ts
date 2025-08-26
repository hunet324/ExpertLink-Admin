// 결제 관리 API 서비스

import { apiClient } from './api';

export type PaymentStatus = 'completed' | 'pending' | 'failed' | 'refunded' | 'cancelled';
export type PaymentMethod = 'card' | 'bank' | 'kakao' | 'paypal';
export type ServiceType = 'video' | 'chat' | 'voice' | 'test';

export interface PaymentRecord {
  id: number;
  transactionId: string;
  userId: number;
  userName: string;
  userEmail: string;
  expertId: number;
  expertName: string;
  serviceType: ServiceType;
  serviceName: string;
  amount: number;
  fee: number;
  netAmount: number;
  paymentMethod: PaymentMethod;
  paymentProvider: string;
  status: PaymentStatus;
  paidAt: string;
  refundedAt?: string;
  refundReason?: string;
  sessionDuration?: number;
  notes?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentListResponse {
  data: PaymentRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaymentStats {
  totalTransactions: number;
  totalAmount: number;
  totalFee: number;
  totalNet: number;
  refundedAmount: number;
  statusCounts: {
    completed: number;
    pending: number;
    failed: number;
    refunded: number;
    cancelled: number;
  };
  serviceStats: {
    video: number;
    chat: number;
    voice: number;
    test: number;
  };
}

export interface PaymentFilters {
  status?: string;
  serviceType?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const paymentService = {
  // 결제 내역 조회
  async getAllPayments(filters: PaymentFilters = {}): Promise<PaymentListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== 'all') {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    const endpoint = queryString ? `/admin/payments?${queryString}` : '/admin/payments';
    
    return apiClient.get<PaymentListResponse>(endpoint);
  },

  // 결제 통계 조회
  async getPaymentStats(startDate?: string, endDate?: string): Promise<PaymentStats> {
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/admin/payments/stats?${queryString}` : '/admin/payments/stats';
    
    return apiClient.get<PaymentStats>(endpoint);
  },

  // 결제 상세 조회
  async getPaymentById(paymentId: number): Promise<PaymentRecord> {
    return apiClient.get<PaymentRecord>(`/admin/payments/${paymentId}`);
  },

  // 결제 환불 처리
  async refundPayment(paymentId: number, reason: string): Promise<{ success: boolean; message: string; data: any }> {
    return apiClient.post<{ success: boolean; message: string; data: any }>(
      `/admin/payments/${paymentId}/refund`,
      { reason }
    );
  }
};