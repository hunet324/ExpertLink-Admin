// 권한 기반 컴포넌트 렌더링 제어

import React from 'react';
import { UserType, User } from '@/types/user';
import { hasMinPermissionLevel, canAccessMenu, isAdmin, getUserType } from '@/utils/permissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  user?: User | null;
  userType?: UserType;
  minLevel?: UserType;
  adminOnly?: boolean;
  centerManagerOnly?: boolean;
  superAdminOnly?: boolean;
  menuPath?: string;
  fallback?: React.ReactNode;
  inverse?: boolean; // 조건을 반전시킬 때 사용
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  user,
  userType: propUserType,
  minLevel,
  adminOnly = false,
  centerManagerOnly = false,
  superAdminOnly = false,
  menuPath,
  fallback = null,
  inverse = false
}) => {
  // userType 추출 (props에서 직접 전달되었거나 user 객체에서 추출)
  const userType = propUserType || getUserType(user);
  
  // userType이 없으면 렌더링하지 않음
  if (!userType) {
    return <>{fallback}</>;
  }

  let hasPermission = true;

  // 최소 권한 레벨 체크
  if (minLevel) {
    hasPermission = hasPermission && hasMinPermissionLevel(userType, minLevel);
  }

  // 관리자 전용 체크
  if (adminOnly) {
    hasPermission = hasPermission && isAdmin(userType);
  }

  // 센터장 이상 전용 체크
  if (centerManagerOnly) {
    hasPermission = hasPermission && hasMinPermissionLevel(userType, 'center_manager');
  }

  // 최고 관리자 전용 체크
  if (superAdminOnly) {
    hasPermission = hasPermission && userType === 'super_admin';
  }

  // 메뉴 접근 권한 체크
  if (menuPath) {
    hasPermission = hasPermission && canAccessMenu(userType, menuPath);
  }

  // 조건 반전
  if (inverse) {
    hasPermission = !hasPermission;
  }

  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

// 권한별 래퍼 컴포넌트들
export const AdminOnly: React.FC<{
  children: React.ReactNode;
  user?: User | null;
  userType?: UserType;
  fallback?: React.ReactNode;
}> = ({ children, user, userType, fallback }) => (
  <PermissionGuard user={user} userType={userType} adminOnly fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const CenterManagerOnly: React.FC<{
  children: React.ReactNode;
  user?: User | null;
  userType?: UserType;
  fallback?: React.ReactNode;
}> = ({ children, user, userType, fallback }) => (
  <PermissionGuard user={user} userType={userType} centerManagerOnly fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const SuperAdminOnly: React.FC<{
  children: React.ReactNode;
  user?: User | null;
  userType?: UserType;
  fallback?: React.ReactNode;
}> = ({ children, user, userType, fallback }) => (
  <PermissionGuard user={user} userType={userType} superAdminOnly fallback={fallback}>
    {children}
  </PermissionGuard>
);

export default PermissionGuard;