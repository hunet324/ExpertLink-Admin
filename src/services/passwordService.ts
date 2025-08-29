import { apiClient } from './api';

// 타입 정의
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface PasswordInfo {
  id: number;
  name: string;
  email: string;
  role: string;
  lastPasswordChange: string;
  loginCount: number;
  lastLogin?: string;
  daysSinceLastChange: number;
  isPasswordExpiringSoon: boolean;
}

export interface PasswordChangeResponse {
  success: boolean;
  message: string;
}

class PasswordService {
  private baseURL = '/auth';

  // 비밀번호 변경
  async changePassword(passwordData: ChangePasswordRequest): Promise<PasswordChangeResponse> {
    return apiClient.post<PasswordChangeResponse>(`${this.baseURL}/change-password`, passwordData);
  }

  // 비밀번호 정보 조회
  async getPasswordInfo(): Promise<PasswordInfo> {
    return apiClient.get<PasswordInfo>(`${this.baseURL}/password-info`);
  }

  // 유틸리티 메서드들
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR');
  }

  getDaysSinceLastChange(lastChangeDate: string): number {
    const lastChange = new Date(lastChangeDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastChange.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  validatePasswordStrength(password: string): {
    level: 'very-weak' | 'weak' | 'medium' | 'strong';
    text: string;
    color: string;
    requirements: Array<{ key: string; description: string; met: boolean }>;
  } {
    const requirements = [
      {
        key: 'length',
        description: '8자 이상',
        met: password.length >= 8
      },
      {
        key: 'uppercase',
        description: '대문자 1개 이상',
        met: /[A-Z]/.test(password)
      },
      {
        key: 'lowercase',
        description: '소문자 1개 이상',
        met: /[a-z]/.test(password)
      },
      {
        key: 'number',
        description: '숫자 1개 이상',
        met: /[0-9]/.test(password)
      },
      {
        key: 'special',
        description: '특수문자 1개 이상',
        met: /[!@#$%^&*(),.?":{}|<>]/.test(password)
      }
    ];

    const metRequirements = requirements.filter(req => req.met).length;
    const strengthPercentage = (metRequirements / requirements.length) * 100;
    
    let level: 'very-weak' | 'weak' | 'medium' | 'strong' = 'very-weak';
    let text = '매우 약함';
    let color = 'bg-gray-400';

    if (strengthPercentage >= 80) {
      level = 'strong';
      text = '강함';
      color = 'bg-green-500';
    } else if (strengthPercentage >= 60) {
      level = 'medium';
      text = '보통';
      color = 'bg-yellow-500';
    } else if (strengthPercentage >= 40) {
      level = 'weak';
      text = '약함';
      color = 'bg-red-500';
    }

    return {
      level,
      text,
      color,
      requirements
    };
  }

  isPasswordValid(password: string): boolean {
    const validation = this.validatePasswordStrength(password);
    return validation.requirements.every(req => req.met);
  }
}

export const passwordService = new PasswordService();
export default passwordService;