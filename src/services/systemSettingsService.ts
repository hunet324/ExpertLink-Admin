import { apiClient } from './api';

// 타입 정의
export interface SystemSetting {
  id: number;
  category: string;
  key: string;
  name: string;
  description?: string;
  valueType: 'text' | 'number' | 'boolean' | 'select' | 'textarea';
  value: string | number | boolean;
  defaultValue: string | number | boolean;
  options?: string[];
  validationRules?: {
    min?: number;
    max?: number;
  };
  required: boolean;
  unit?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategorySettings {
  category: string;
  categoryName: string;
  categoryIcon: string;
  categoryDescription: string;
  settings: SystemSetting[];
}

export interface AllSettingsResponse {
  categories: CategorySettings[];
}

export interface UpdateSettingRequest {
  value: string;
}

export interface BulkUpdateSettingsRequest {
  settings: Record<string, string>;
}

class SystemSettingsService {
  private baseURL = '/admin/system-settings';

  // 모든 설정 조회
  async getAllSettings(): Promise<AllSettingsResponse> {
    return apiClient.get<AllSettingsResponse>(this.baseURL);
  }

  // 카테고리별 설정 조회
  async getSettingsByCategory(category: string): Promise<CategorySettings> {
    return apiClient.get<CategorySettings>(`${this.baseURL}/category/${category}`);
  }

  // 특정 설정 조회
  async getSettingByKey(key: string): Promise<SystemSetting> {
    return apiClient.get<SystemSetting>(`${this.baseURL}/${key}`);
  }

  // 설정 업데이트
  async updateSetting(key: string, request: UpdateSettingRequest): Promise<SystemSetting> {
    return apiClient.put<SystemSetting>(`${this.baseURL}/${key}`, request);
  }

  // 여러 설정 일괄 업데이트
  async bulkUpdateSettings(request: BulkUpdateSettingsRequest): Promise<AllSettingsResponse> {
    return apiClient.put<AllSettingsResponse>(this.baseURL, request);
  }

  // 설정 기본값으로 리셋
  async resetSetting(key: string): Promise<SystemSetting> {
    return apiClient.put<SystemSetting>(`${this.baseURL}/${key}/reset`);
  }

  // 유틸리티 메서드들
  validateSettingValue(setting: SystemSetting, value: string | number | boolean): string | null {
    // 필수 값 체크
    if (setting.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${setting.name}은(는) 필수 설정입니다`;
    }

    // 타입별 유효성 검증
    switch (setting.valueType) {
      case 'number':
        const numValue = Number(value);
        if (isNaN(numValue)) {
          return `${setting.name}은(는) 숫자여야 합니다`;
        }
        
        if (setting.validationRules) {
          if (setting.validationRules.min !== undefined && numValue < setting.validationRules.min) {
            return `${setting.name}은(는) 최소 ${setting.validationRules.min} 이상이어야 합니다`;
          }
          if (setting.validationRules.max !== undefined && numValue > setting.validationRules.max) {
            return `${setting.name}은(는) 최대 ${setting.validationRules.max} 이하여야 합니다`;
          }
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
          return `${setting.name}은(는) true 또는 false여야 합니다`;
        }
        break;

      case 'select':
        if (setting.options && !setting.options.includes(String(value))) {
          return `${setting.name}의 값이 올바르지 않습니다. 가능한 값: ${setting.options.join(', ')}`;
        }
        break;
    }

    return null; // 유효함
  }

  // 설정값을 문자열로 변환 (API 전송용)
  convertValueToString(value: string | number | boolean): string {
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    return String(value);
  }

  // 설정의 현재 값을 적절한 타입으로 변환
  convertStringToTypedValue(setting: SystemSetting, stringValue: string): string | number | boolean {
    switch (setting.valueType) {
      case 'number':
        return Number(stringValue);
      case 'boolean':
        return stringValue === 'true';
      default:
        return stringValue;
    }
  }
}

export const systemSettingsService = new SystemSettingsService();
export default systemSettingsService;