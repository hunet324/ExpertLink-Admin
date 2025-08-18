import { User, UserType } from './user';

// API 스펙에 맞는 인증 관련 타입 정의

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  userType?: UserType;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface RefreshTokenResponseDto {
  accessToken: string;
  refreshToken: string;
}

// 프론트엔드에서 사용할 인증 상태 타입
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// API 에러 응답 타입
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

// 로그인 폼 데이터 타입
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

// 회원가입 폼 데이터 타입
export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  userType: UserType;
  bio?: string;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
}