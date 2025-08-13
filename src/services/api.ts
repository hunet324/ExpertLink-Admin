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

// 헤더 유틸리티
const createHeaders = (additionalHeaders?: HeadersInit): Record<string, string> => {
  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // 추가 헤더가 있으면 병합
  if (additionalHeaders) {
    Object.assign(baseHeaders, additionalHeaders);
  }

  // 토큰이 있으면 Authorization 헤더 추가
  const accessToken = tokenManager.getAccessToken();
  if (accessToken) {
    baseHeaders.Authorization = `Bearer ${accessToken}`;
  }

  return baseHeaders;
};

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
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
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
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // 토큰 만료 체크 및 자동 갱신
    const accessToken = tokenManager.getAccessToken();
    if (accessToken && tokenManager.isTokenExpired(accessToken)) {
      console.log('토큰이 만료되었습니다. 갱신을 시도합니다.');
      try {
        const { authService } = await import('./auth');
        await authService.refreshToken();
        console.log('토큰 갱신 성공');
      } catch (error) {
        console.error('토큰 갱신 실패:', error);
        // 토큰 갱신 실패 시 로그아웃 처리
        tokenManager.clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw {
          statusCode: 401,
          message: '인증이 만료되었습니다. 다시 로그인해주세요.'
        } as ApiError;
      }
    }
    
    // 기본 헤더 설정
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // 갱신된 토큰으로 Authorization 헤더 추가
    const currentToken = tokenManager.getAccessToken();
    if (currentToken) {
      headers.Authorization = `Bearer ${currentToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    // 디버깅을 위한 로그
    console.log('API Request:', { url, config });

    try {
      const response = await fetch(url, config);
      
      console.log('API Response:', { 
        status: response.status, 
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      // 401 에러인 경우 토큰 갱신 후 재시도 (1회만)
      if (response.status === 401 && retryCount === 0) {
        console.log('401 에러 발생, 토큰 갱신 후 재시도');
        try {
          const { authService } = await import('./auth');
          await authService.refreshToken();
          return this.request<T>(endpoint, options, retryCount + 1);
        } catch (refreshError) {
          console.error('토큰 갱신 실패:', refreshError);
          tokenManager.clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
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