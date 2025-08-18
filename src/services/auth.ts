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
    tokenManager.setTokens(response.accessToken, response.refreshToken);
    
    return response;
  }

  /**
   * 로그인
   */
  async login(credentials: LoginDto): Promise<AuthResponseDto> {
    const response = await apiClient.post<AuthResponseDto>('/auth/login', credentials);
    
    console.log('로그인 API 응답:', response);
    console.log('사용자 정보:', response.user);
    console.log('토큰 정보:', { 
      hasAccessToken: !!response.accessToken,
      hasRefreshToken: !!response.refreshToken
    });
    
    // 토큰 저장
    tokenManager.setTokens(response.accessToken, response.refreshToken);
    
    return response;
  }

  /**
   * 로그아웃
   */
  async logout(): Promise<void> {
    console.log('AuthService.logout 시작');
    try {
      // 로컬 토큰 먼저 제거 (자동 갱신 방지)
      const accessToken = tokenManager.getAccessToken();
      tokenManager.clearTokens();
      console.log('로컬 토큰 제거 완료');
      
      // 서버에 로그아웃 요청 (토큰이 있었던 경우에만)
      if (accessToken) {
        await apiClient.post('/auth/logout', {}, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        console.log('서버 로그아웃 성공');
      }
    } catch (error) {
      // 서버 로그아웃 실패해도 무시 (로컬 토큰은 이미 제거됨)
      console.warn('서버 로그아웃 실패 (무시):', error);
    }
    console.log('AuthService.logout 완료');
  }

  /**
   * 토큰 갱신 기능 제거됨 (무한루프 방지)
   */
  async refreshToken(): Promise<RefreshTokenResponseDto> {
    throw new Error('토큰 갱신 기능이 제거되었습니다. 다시 로그인해주세요.');
  }

  /**
   * 현재 사용자 정보 조회
   */
  async getCurrentUser(forceRefresh: boolean = false): Promise<User> {
    // 토큰 존재 여부 확인
    const currentToken = tokenManager.getAccessToken();
    console.log('getCurrentUser 토큰 확인:', {
      hasToken: !!currentToken,
      tokenPrefix: currentToken?.substring(0, 20) + '...',
      localStorage: !!localStorage.getItem('expertlink_access_token')
    });
    
    if (!currentToken) {
      throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
    }
    
    const headers: Record<string, string> = {};
    
    // 강제 새로고침이 필요한 경우 캐시 방지 헤더 추가
    if (forceRefresh) {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      headers['Pragma'] = 'no-cache';
      headers['Expires'] = '0';
    }
    
    console.log('사용자 프로필 API 호출 시작');
    
    try {
      const user = await apiClient.get<User>('/users/profile', { headers });
      console.log('사용자 프로필 조회 성공:', user);
      console.log('사용자 타입 필드들:', {
        userType: user.userType,
        user_type: user.user_type,
        allFields: Object.keys(user)
      });
      
      // user_type 필드가 누락된 경우 경고
      if (!user.userType && !user.user_type) {
        console.warn('⚠️ API 응답에 사용자 타입 정보가 없습니다. 서버 API를 확인하세요.');
      }
      
      return user;
    } catch (error) {
      console.error('사용자 프로필 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 토큰 유효성 검사만 수행 (자동 갱신 제거)
   */
  async validateAndRefreshToken(): Promise<boolean> {
    const accessToken = tokenManager.getAccessToken();

    // 토큰이 없으면 false
    if (!accessToken) {
      return false;
    }

    // Access Token이 만료되었는지 확인
    if (tokenManager.isTokenExpired(accessToken)) {
      // 만료된 경우 토큰 제거하고 false 반환
      tokenManager.clearTokens();
      return false;
    }

    return true;
  }

  /**
   * 사용자 타입별 리다이렉트 경로 반환
   */
  getUserTypeRedirectPath(userType: string | undefined): string {
    console.log('getUserTypeRedirectPath 호출됨:', userType);
    
    switch (userType) {
      case 'admin':
        return '/admin/dashboard';
      case 'expert':
        return '/expert/dashboard';
      case 'general':
        return '/client/dashboard';
      default:
        console.warn('알 수 없는 사용자 타입:', userType, '기본 경로로 이동');
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