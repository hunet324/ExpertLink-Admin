// 권한 체크 유틸리티 함수들

import { UserType, AdminLevel, PermissionLevel, Permission, PermissionContext, User } from '@/types/user';

/**
 * User 객체에서 UserType을 안전하게 추출하는 유틸리티 함수
 */
export function getUserType(user: User | null | undefined): UserType | null {
  if (!user) return null;
  return user.userType || user.userType || null;
}

/**
 * 사용자 타입을 권한 레벨로 변환
 */
export function getUserPermissionLevel(userType: UserType | null): number {
  if (!userType) return 0;
  return PermissionLevel[userType.toUpperCase() as keyof typeof PermissionLevel] || 0;
}

/**
 * 관리자 권한인지 확인
 */
export function isAdmin(userType: UserType | null): boolean {
  if (!userType) return false;
  return ['staff', 'center_manager', 'regional_manager', 'super_admin'].includes(userType);
}

/**
 * 최소 권한 레벨 확인
 */
export function hasMinPermissionLevel(userType: UserType | null, minLevel: UserType): boolean {
  if (!userType) return false;
  const userLevel = getUserPermissionLevel(userType);
  const requiredLevel = getUserPermissionLevel(minLevel);
  return userLevel >= requiredLevel;
}

/**
 * 특정 센터에 대한 접근 권한 확인
 */
export function canAccessCenter(
  userType: UserType, 
  userCenterId?: number, 
  targetCenterId?: number
): boolean {
  // 최고 관리자는 모든 센터 접근 가능
  if (userType === 'super_admin') return true;
  
  // 지역 관리자는 담당 지역의 센터들 접근 가능 (실제로는 region_id로 체크해야 함)
  if (userType === 'regional_manager') return true;
  
  // 센터장과 직원은 자신의 센터만 접근 가능
  if (userType === 'center_manager' || userType === 'staff') {
    return userCenterId === targetCenterId;
  }
  
  return false;
}

/**
 * 사용자 관리 권한 확인
 */
export function canManageUser(
  currentUserType: UserType,
  currentCenterId?: number,
  targetUserType?: UserType,
  targetCenterId?: number
): boolean {
  // 최고 관리자는 모든 사용자 관리 가능
  if (currentUserType === 'super_admin') return true;
  
  // 지역 관리자는 담당 지역의 센터장과 직원 관리 가능
  if (currentUserType === 'regional_manager') {
    return targetUserType !== 'super_admin';
  }
  
  // 센터장은 같은 센터의 직원만 관리 가능
  if (currentUserType === 'center_manager') {
    return (
      targetUserType === 'staff' && 
      currentCenterId === targetCenterId
    );
  }
  
  // 직원은 다른 사용자 관리 불가
  return false;
}

/**
 * 메뉴 접근 권한 확인
 */
export function canAccessMenu(userType: UserType | null, menuPath: string): boolean {
  if (!userType) return false;
  const adminPaths = [
    '/admin/dashboard',
    '/admin/approval',
    '/admin/cms',
    '/admin/partnership',
    '/admin/statistics',
    '/admin/system'
  ];
  
  const centerManagerPaths = [
    '/admin/centers',
    '/admin/experts',
    '/admin/schedules'
  ];
  
  const superAdminOnlyPaths = [
    '/admin/system/settings',
    '/admin/system/permissions',
    '/admin/centers/create'
  ];
  
  // 관리자 경로 체크
  if (adminPaths.some(path => menuPath.startsWith(path))) {
    return isAdmin(userType);
  }
  
  // 센터 관리자 이상 권한 필요
  if (centerManagerPaths.some(path => menuPath.startsWith(path))) {
    return hasMinPermissionLevel(userType, 'center_manager');
  }
  
  // 최고 관리자 전용 메뉴
  if (superAdminOnlyPaths.some(path => menuPath.startsWith(path))) {
    return userType === 'super_admin';
  }
  
  return true;
}

/**
 * 사용자 권한 정보 생성
 */
export function generateUserPermissions(
  userType: UserType,
  centerId?: number,
  supervisorId?: number
): Permission {
  const isAdminUser = isAdmin(userType);
  const isCenterManager = hasMinPermissionLevel(userType, 'center_manager');
  const isRegionalManager = hasMinPermissionLevel(userType, 'regional_manager');
  const isSuperAdmin = userType === 'super_admin';
  
  return {
    canManageUsers: isCenterManager,
    canManageExperts: isCenterManager,
    canManageCenters: isRegionalManager,
    canViewAllCenters: isRegionalManager,
    canManageSchedules: isCenterManager,
    canApproveVacations: isCenterManager,
    canViewStatistics: isAdminUser,
    canManageSystem: isSuperAdmin,
    allowedCenterIds: isSuperAdmin ? [] : (centerId ? [centerId] : []), // 빈 배열은 모든 센터 접근 가능을 의미
    supervisedUserIds: [] // 실제로는 API에서 조회해야 함
  };
}

/**
 * 권한 컨텍스트 기반 접근 확인
 */
export function checkPermissionContext(context: PermissionContext): boolean {
  const { userType, centerId, targetUserId, targetCenterId } = context;
  
  // 기본적인 권한 체크
  if (!isAdmin(userType)) return false;
  
  // 센터 접근 권한 체크
  if (targetCenterId && !canAccessCenter(userType, centerId, targetCenterId)) {
    return false;
  }
  
  return true;
}

/**
 * 관리자 등급 표시 텍스트 반환
 */
export function getAdminLevelText(userType: UserType): string {
  const levelTexts = {
    'staff': '직원',
    'center_manager': '센터장',
    'regional_manager': '지역관리자',
    'super_admin': '최고관리자',
    'expert': '전문가',
    'general': '일반사용자'
  };
  
  return levelTexts[userType] || '알 수 없음';
}

/**
 * 권한 레벨 색상 반환 (TailwindCSS 클래스)
 */
export function getPermissionLevelColor(userType: UserType): string {
  const colors = {
    'super_admin': 'bg-red-100 text-red-800',
    'regional_manager': 'bg-purple-100 text-purple-800',
    'center_manager': 'bg-blue-100 text-blue-800',
    'staff': 'bg-green-100 text-green-800',
    'expert': 'bg-yellow-100 text-yellow-800',
    'general': 'bg-gray-100 text-gray-800'
  };
  
  return colors[userType] || 'bg-gray-100 text-gray-800';
}