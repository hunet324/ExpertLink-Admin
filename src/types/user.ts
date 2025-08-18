// API 스펙에 맞는 사용자 타입 정의

export type UserType = 'general' | 'expert' | 'admin';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  // API가 camelCase와 snake_case 둘 다 지원하도록
  userType?: UserType;
  user_type?: UserType;
  status: UserStatus;
  // API 응답 구조에 맞는 필드들
  profileImage?: string;
  profile_image?: string;
  bio?: string;
  signupDate?: string;
  signup_date?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface UpdateProfileDto {
  name?: string;
  phone?: string;
  bio?: string;
}

export interface ProfileResponseDto extends User {
  // 프로필 조회 시 추가 정보가 있다면 여기에 정의
}