// API 스펙에 맞는 사용자 타입 정의

export type UserType = 'general' | 'expert' | 'staff' | 'center_manager' | 'regional_manager' | 'super_admin';

// 관리자 등급 타입
export type AdminLevel = 'staff' | 'center_manager' | 'regional_manager' | 'super_admin';

// 권한 레벨 (숫자로 비교 가능)
export enum PermissionLevel {
  GENERAL = 0,
  EXPERT = 1,
  STAFF = 2,
  CENTER_MANAGER = 3,
  REGIONAL_MANAGER = 4,
  SUPER_ADMIN = 5,
}
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
  
  // 센터 및 계층 정보
  centerId?: number;
  center_id?: number;
  centerName?: string;
  center_name?: string;
  supervisorId?: number;
  supervisor_id?: number;
  adminLevel?: AdminLevel;
  admin_level?: AdminLevel;
  
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

// 센터 정보 타입
export interface Center {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  managerId?: number;
  manager_id?: number;
  parentCenterId?: number;
  parent_center_id?: number;
  regionId?: number;
  region_id?: number;
  createdAt?: string;
  created_at?: string;
}

// 권한 정보 타입
export interface Permission {
  canManageUsers: boolean;
  canManageExperts: boolean;
  canManageCenters: boolean;
  canViewAllCenters: boolean;
  canManageSchedules: boolean;
  canApproveVacations: boolean;
  canViewStatistics: boolean;
  canManageSystem: boolean;
  allowedCenterIds: number[];
  supervisedUserIds: number[];
}

// 권한 체크 유틸리티 함수용 타입
export interface PermissionContext {
  userType: UserType;
  centerId?: number;
  supervisorId?: number;
  targetUserId?: number;
  targetCenterId?: number;
}