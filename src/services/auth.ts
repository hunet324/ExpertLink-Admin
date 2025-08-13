// 인증 관련 API 서비스

import { 
  RegisterDto, 
  LoginDto, 
  AuthResponseDto, 
  RefreshTokenDto, 
  RefreshTokenResponseDto 
} from '@/types/auth';
import { User } from '@/types/user';
import { apiClient, tokenManager } from './api';

export class AuthService {
  
  /**
   * 회원가입 (로그인 없이)
   */
  async register(userData: RegisterDto): Promise<AuthResponseDto> {
    const response = await apiClient.post<AuthResponseDto>('/auth/register', userData);
    
    // 토큰 저장하지 않음 (승인 대기 상태)
    // tokenManager.setTokens(response.access_token, response.refresh_token);
    
    return response;
  }

  /**
   * 회원가입 후 즉시 로그인 (관리자나 특별한 경우)
   */
  async registerAndLogin(userData: RegisterDto): Promise<AuthResponseDto> {
    const response = await apiClient.post<AuthResponseDto>('/auth/register', userData);
    
    // 토큰 저장하여 즉시 로그인
    tokenManager.setTokens(response.access_token, response.refresh_token);
    
    return response;
  }

  /**
   * 로그인
   */
  async login(credentials: LoginDto): Promise<AuthResponseDto> {
    const response = await apiClient.post<AuthResponseDto>('/auth/login', credentials);
    
    // 토큰 저장
    tokenManager.setTokens(response.access_token, response.refresh_token);
    
    return response;
  }

  /**
   * 로그아웃
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // 서버 로그아웃 실패해도 로컬 토큰은 제거
      console.warn('서버 로그아웃 실패:', error);
    } finally {
      // 로컬 토큰 제거
      tokenManager.clearTokens();
    }
  }

  /**
   * 토큰 갱신
   */
  async refreshToken(): Promise<RefreshTokenResponseDto> {
    const refreshToken = tokenManager.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('Refresh token이 없습니다.');
    }

    const response = await apiClient.post<RefreshTokenResponseDto>('/auth/refresh', {
      refresh_token: refreshToken
    });

    // 새로운 토큰 저장
    tokenManager.setTokens(response.access_token, response.refresh_token);

    return response;
  }

  /**
   * 현재 사용자 정보 조회
   */
  async getCurrentUser(): Promise<User> {
    return await apiClient.get<User>('/users/profile');
  }

  /**
   * 토큰 유효성 검사 및 자동 갱신
   */
  async validateAndRefreshToken(): Promise<boolean> {
    const accessToken = tokenManager.getAccessToken();
    const refreshToken = tokenManager.getRefreshToken();

    // 토큰이 없으면 false
    if (!accessToken || !refreshToken) {
      return false;
    }

    // Access Token이 만료되었는지 확인
    if (tokenManager.isTokenExpired(accessToken)) {
      try {
        // Refresh Token으로 새 토큰 발급
        await this.refreshToken();
        return true;
      } catch (error) {
        // Refresh Token도 만료되었거나 유효하지 않음
        tokenManager.clearTokens();
        return false;
      }
    }

    return true;
  }

  /**
   * 사용자 타입별 리다이렉트 경로 반환
   */
  getUserTypeRedirectPath(userType: string): string {
    switch (userType) {
      case 'admin':
        return '/admin/dashboard';
      case 'expert':
        return '/expert/dashboard';
      case 'general':
        return '/client/dashboard';
      default:
        return '/';
    }
  }

  /**
   * 현재 인증 상태 확인
   */
  isAuthenticated(): boolean {
    const accessToken = tokenManager.getAccessToken();
    return !!accessToken && !tokenManager.isTokenExpired(accessToken);
  }
}

// AuthService 인스턴스 생성 및 내보내기
export const authService = new AuthService();