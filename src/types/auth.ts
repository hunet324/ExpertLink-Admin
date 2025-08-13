import { User, UserType } from './user';

// API 스펙에 맞는 인증 관련 타입 정의

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  user_type?: UserType;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface RefreshTokenDto {
  refresh_token: string;
}

export interface RefreshTokenResponseDto {
  access_token: string;
  refresh_token: string;
}

// 프론트엔드에서 사용할 인증 상태 타입
export interface AuthState {
  user: User | null;
  access_token: string | null;
  refresh_token: string | null;
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
  user_type: UserType;
  bio?: string;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
}