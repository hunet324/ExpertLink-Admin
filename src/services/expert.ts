// 전문가 관련 API 서비스

import { apiClient } from './api';

// 전문가 프로필 타입 정의
export interface ExpertProfile {
  id: number;
  userId: number;
  licenseNumber: string;
  licenseType: string;
  yearsExperience: number;
  hourlyRate: number;
  isVerified: boolean;
  specialization: string[];
  introduction?: string;
  createdAt: string;
  updatedAt: string;
}

// 전문가 프로필 업데이트 요청 타입
export interface UpdateExpertProfileRequest {
  licenseNumber?: string;
  licenseType?: string;
  yearsExperience?: number;
  hourlyRate?: number;
  specialization?: string[];
  introduction?: string;
}

// 전문가 프로필 응답 타입
export interface ExpertProfileResponse {
  profile: ExpertProfile;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
    userType: string;
  };
}

// Expert Service
export const expertService = {
  // 전문가 프로필 조회
  async getProfile(): Promise<ExpertProfileResponse> {
    try {
      const response = await apiClient.get<ExpertProfileResponse>('/experts/profile');
      return response;
    } catch (error: any) {
      console.error('전문가 프로필 조회 실패:', error);
      throw error;
    }
  },

  // 전문가 프로필 업데이트
  async updateProfile(data: UpdateExpertProfileRequest): Promise<ExpertProfile> {
    try {
      console.group('🔄 Expert Profile Update');
      console.log('Update data being sent:', data);
      console.log('Data validation:', {
        hasLicenseNumber: !!data.licenseNumber,
        hasLicenseType: !!data.licenseType,
        yearsExperience: data.yearsExperience,
        hourlyRate: data.hourlyRate,
        specializationCount: data.specialization?.length || 0,
        hasIntroduction: !!data.introduction
      });
      
      const response = await apiClient.put<ExpertProfile>('/experts/profile', data);
      
      console.log('✅ Expert profile update successful');
      console.groupEnd();
      return response;
    } catch (error: any) {
      console.group('❌ Expert Profile Update Failed');
      console.error('Error details:', error);
      console.error('Request data:', data);
      console.groupEnd();
      throw error;
    }
  },

  // 전문가 스케줄 조회
  async getMySchedules(): Promise<any[]> {
    try {
      const response = await apiClient.get<any[]>('/experts/schedules/me');
      return response;
    } catch (error: any) {
      console.error('전문가 스케줄 조회 실패:', error);
      throw error;
    }
  }
};