// API 기본 설정 및 공통 유틸리티

import { ApiError } from '@/types/auth';

// API 기본 URL (환경 변수로 관리 가능)
const useProxy = process.env.NEXT_PUBLIC_USE_PROXY === 'true';
export const API_BASE_URL = useProxy 
  ? '/api/proxy' // Next.js 프록시 사용
  : (process.env.NEXT_PUBLIC_API_URL || 'http://kkssyy.ipdisk.co.kr:5700'); // 직접 연결

// 디버깅을 위한 로그
console.log('API Configuration:', { 
  useProxy, 
  API_BASE_URL,
  NODE_ENV: process.env.NODE_ENV 
});

// 토큰 저장소 키
export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'expertlink_access_token',
  REFRESH_TOKEN: 'expertlink_refresh_token',
} as const;


// 토큰 관리 유틸리티
export const tokenManager = {
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  },
  
  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  },
  
  setTokens: (accessToken: string, refreshToken: string): void => {
    if (typeof window === 'undefined') return;
    
    console.log('토큰 저장 시작:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenPrefix: accessToken?.substring(0, 20) + '...'
    });
    
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
    
    // 저장 확인
    const storedToken = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    console.log('토큰 저장 완료:', {
      stored: !!storedToken,
      matches: storedToken === accessToken
    });
  },
  
  clearTokens: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
  },
  
  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
};

// API 요청 헬퍼
export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // 토큰 먼저 확인
    const accessToken = tokenManager.getAccessToken();
    console.log('API 클라이언트 토큰 체크:', {
      hasToken: !!accessToken,
      tokenSource: accessToken ? 'tokenManager' : 'none',
      localStorageCheck: !!localStorage.getItem('expertlink_access_token')
    });

    // 기본 헤더 설정 (Authorization 헤더를 먼저 설정)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // 토큰이 있으면 Authorization 헤더 추가
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
      console.log('Authorization 헤더 설정됨:', headers.Authorization.substring(0, 30) + '...');
      
      // 토큰에서 사용자 정보 추출하여 센터 정보 헤더 추가
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        if (payload.center_id) {
          headers['X-Center-Id'] = payload.center_id.toString();
        }
        if (payload.user_type) {
          headers['X-User-Type'] = payload.user_type;
        }
      } catch (e) {
        console.warn('토큰에서 사용자 정보 추출 실패:', e);
      }
    }

    // 추가 헤더 병합 (Authorization 헤더가 덮어씌워지지 않도록 주의)
    if (options.headers) {
      const additionalHeaders = options.headers as Record<string, string>;
      Object.keys(additionalHeaders).forEach(key => {
        // Authorization 헤더는 덮어씌우지 않음 (토큰이 있는 경우)
        if (key.toLowerCase() !== 'authorization' || !accessToken) {
          headers[key] = additionalHeaders[key];
        }
      });
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    // 단순화된 디버깅 로그
    console.log('API Request:', { url, method: config.method, hasToken: !!accessToken });
    
    if (accessToken) {
      console.log('Authorization Header:', headers.Authorization?.substring(0, 20) + '...');
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        console.log('토큰 정보:', { 
          user_type: payload.user_type, 
          email: payload.email,
          exp: new Date(payload.exp * 1000).toLocaleString()
        });
      } catch (e) {
        console.warn('토큰 디코딩 실패:', e);
      }
    } else {
      console.warn('⚠️ API 요청에 토큰이 없습니다!');
    }

    try {
      const response = await fetch(url, config);
      
      console.log('API Response:', response.status, response.statusText);
      
      // 401 에러 시 단순히 로그인 페이지로 리다이렉트 (갱신 시도 없음)
      if (response.status === 401) {
        console.log('401 에러: 로그인이 필요합니다.');
        tokenManager.clearTokens();
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        throw {
          statusCode: 401,
          message: '로그인이 필요합니다.'
        } as ApiError;
      }
      
      // 응답이 성공적이지 않은 경우
      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          statusCode: response.status,
          message: response.statusText,
        }));
        
        console.error('API Error:', errorData);
        throw errorData;
      }

      // 응답이 비어있는 경우 (204 No Content 등)
      if (response.status === 204) {
        return {} as T;
      }

      const responseData = await response.json();
      console.log('API Success:', responseData);
      return responseData;
    } catch (error) {
      console.error('Network Error:', error);
      
      // 네트워크 오류 등
      if (error instanceof TypeError) {
        throw {
          statusCode: 0,
          message: '네트워크 연결을 확인해주세요.',
          originalError: error.message
        } as ApiError;
      }
      
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// 기본 API 클라이언트 인스턴스
export const apiClient = new ApiClient();